import { Buffer } from "node:buffer";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import nodemailer from "nodemailer";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_BODY_SIZE = 6 * 1024 * 1024;
const localStoragePath =
  process.env.SITE_DATA_STORAGE_PATH ||
  path.join(os.tmpdir(), "talme-website-data.json");
const remoteStorageUrl =
  process.env.SITE_REDIS_REST_URL ||
  process.env.NEWS_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  "";
const remoteStorageToken =
  process.env.SITE_REDIS_REST_TOKEN ||
  process.env.NEWS_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "";
const storageKey = process.env.SITE_DATA_STORAGE_KEY || "talme:website-data";
const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
);
const backendProxyOrigin = (
  process.env.TALME_BACKEND_ORIGIN ||
  process.env.SITE_BACKEND_ORIGIN ||
  "https://talme-website.onrender.com"
).replace(/\/+$/, "");

export const config = {
  api: {
    bodyParser: false,
  },
};

class BadRequestError extends Error {}
class StorageConfigError extends Error {}

const emptySiteData = {
  contacts: [],
  careers: [],
  chatMessages: [],
  updatedAt: "",
};

function shouldProxyToBackend(req) {
  if (!process.env.VERCEL || !backendProxyOrigin) {
    return false;
  }

  const requestHost = getHeader(req, "host");

  try {
    return new URL(backendProxyOrigin).host !== requestHost;
  } catch {
    return false;
  }
}

function getProxyHeaders(req) {
  const excludedHeaders = new Set([
    "connection",
    "content-length",
    "host",
    "transfer-encoding",
  ]);
  const headers = {};

  for (const [name, value] of Object.entries(req.headers || {})) {
    if (excludedHeaders.has(name.toLowerCase()) || value === undefined) {
      continue;
    }

    headers[name] = Array.isArray(value) ? value.join(", ") : value;
  }

  return headers;
}

async function proxyToBackend(req, res) {
  const requestUrl = new URL(req.url || "/api/backend", "http://localhost");
  const targetUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, backendProxyOrigin);
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await readRequestBody(req, MAX_BODY_SIZE);
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: getProxyHeaders(req),
    body,
  });
  const responseBody = Buffer.from(await response.arrayBuffer());

  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    const lowerName = name.toLowerCase();
    if (
      lowerName === "content-encoding" ||
      lowerName === "content-length" ||
      lowerName === "transfer-encoding"
    ) {
      return;
    }

    res.setHeader(name, value);
  });
  res.end(responseBody);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

function hasRemoteStorage() {
  return Boolean(remoteStorageUrl && remoteStorageToken);
}

function getStorageMode() {
  if (hasRemoteStorage()) {
    return "remote";
  }

  return isServerlessRuntime ? "readonly" : "local";
}

function getStorageSetupMessage() {
  return "Persistent website storage is not configured. Add Vercel KV or Upstash REST credentials, then redeploy.";
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-key");
  res.setHeader("Access-Control-Expose-Headers", "X-Website-Storage-Mode");
  res.setHeader("X-Website-Storage-Mode", getStorageMode());
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

function sendJson(res, statusCode, payload) {
  if (typeof res.setHeader === "function") {
    setCorsHeaders(res);
  }

  if (typeof res.status === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(payload));
}

function getHeader(req, name) {
  const headers = req.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function requireAdmin(req, res) {
  const configuredKey = process.env.SITE_ADMIN_KEY || process.env.NEWS_ADMIN_KEY;
  const requestKey = getHeader(req, "x-admin-key");

  if (!configuredKey) {
    sendJson(res, 500, { error: "Website admin key is not configured." });
    return false;
  }

  if (requestKey !== configuredKey) {
    sendJson(res, 401, { error: "Invalid admin key." });
    return false;
  }

  return true;
}

function createRecordId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSiteData(value) {
  return {
    ...emptySiteData,
    ...(value && typeof value === "object" ? value : {}),
    contacts: Array.isArray(value?.contacts) ? value.contacts : [],
    careers: Array.isArray(value?.careers) ? value.careers : [],
    chatMessages: Array.isArray(value?.chatMessages) ? value.chatMessages : [],
  };
}

async function runRemoteStorageCommand(command) {
  const response = await fetch(remoteStorageUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${remoteStorageToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.error) {
    throw new Error(result.error || "Unable to access website storage.");
  }

  return result.result;
}

async function readLocalSiteData() {
  try {
    const raw = await readFile(localStoragePath, "utf8");
    return normalizeSiteData(JSON.parse(raw));
  } catch {
    return { ...emptySiteData };
  }
}

async function writeLocalSiteData(data) {
  await mkdir(path.dirname(localStoragePath), { recursive: true });
  await writeFile(localStoragePath, JSON.stringify(data, null, 2));
}

async function readSiteData() {
  if (hasRemoteStorage()) {
    const raw = await runRemoteStorageCommand(["GET", storageKey]);
    return normalizeSiteData(raw ? JSON.parse(raw) : emptySiteData);
  }

  return readLocalSiteData();
}

async function writeSiteData(data) {
  const nextData = {
    ...normalizeSiteData(data),
    updatedAt: new Date().toISOString(),
  };

  if (hasRemoteStorage()) {
    await runRemoteStorageCommand(["SET", storageKey, JSON.stringify(nextData)]);
    return nextData;
  }

  if (isServerlessRuntime) {
    throw new StorageConfigError(getStorageSetupMessage());
  }

  await writeLocalSiteData(nextData);
  return nextData;
}

async function appendRecord(collectionName, record) {
  const currentData = await readSiteData();
  const records = Array.isArray(currentData[collectionName])
    ? currentData[collectionName]
    : [];
  const nextRecord = {
    ...record,
    createdAt: new Date().toISOString(),
  };

  await writeSiteData({
    ...currentData,
    [collectionName]: [nextRecord, ...records],
  });

  return nextRecord;
}

async function tryAppendRecord(collectionName, record) {
  try {
    const savedRecord = await appendRecord(collectionName, record);
    return { record: savedRecord, stored: true, storageError: "" };
  } catch (error) {
    return {
      record: {
        ...record,
        createdAt: new Date().toISOString(),
      },
      stored: false,
      storageError: error instanceof Error ? error.message : "Unable to store submission.",
    };
  }
}

async function readRequestBody(req, maxSize = MAX_BODY_SIZE) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxSize) {
      throw new BadRequestError("Uploaded content is too large.");
    }

    return req.body;
  }

  if (typeof req.body === "string") {
    const bodyBuffer = Buffer.from(req.body);
    if (bodyBuffer.length > maxSize) {
      throw new BadRequestError("Uploaded content is too large.");
    }

    return bodyBuffer;
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bufferChunk.length;

    if (size > maxSize) {
      throw new BadRequestError("Uploaded content is too large.");
    }

    chunks.push(bufferChunk);
  }

  return Buffer.concat(chunks);
}

async function readJsonPayload(req) {
  if (req.body && !Buffer.isBuffer(req.body) && typeof req.body === "object") {
    return req.body;
  }

  const bodyBuffer = await readRequestBody(req, 1024 * 1024);
  const bodyText = bodyBuffer.toString("utf8");
  return bodyText ? JSON.parse(bodyText) : {};
}

function splitBuffer(buffer, separator) {
  const segments = [];
  let searchStart = 0;
  let index = buffer.indexOf(separator, searchStart);

  while (index !== -1) {
    segments.push(buffer.subarray(searchStart, index));
    searchStart = index + separator.length;
    index = buffer.indexOf(separator, searchStart);
  }

  segments.push(buffer.subarray(searchStart));
  return segments;
}

function getMultipartBoundary(contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return boundaryMatch ? boundaryMatch[1] || boundaryMatch[2] : "";
}

function parseMultipartForm(bodyBuffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const parts = splitBuffer(bodyBuffer, boundaryBuffer);
  const fields = {};
  let file = null;

  for (const rawPart of parts) {
    if (!rawPart.length) {
      continue;
    }

    let part = rawPart;
    if (part.subarray(0, 2).equals(Buffer.from("\r\n"))) {
      part = part.subarray(2);
    }

    if (part.equals(Buffer.from("--\r\n")) || part.equals(Buffer.from("--"))) {
      continue;
    }

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) {
      continue;
    }

    const headerText = part.subarray(0, headerEnd).toString("utf8");
    const content = part.subarray(headerEnd + 4, part.length - 2);
    const nameMatch = headerText.match(/name="([^"]+)"/i);

    if (!nameMatch) {
      continue;
    }

    const fieldName = nameMatch[1];
    const filenameMatch = headerText.match(/filename="([^"]*)"/i);
    const typeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);

    if (filenameMatch) {
      if (!filenameMatch[1]) {
        continue;
      }

      file = {
        fieldName,
        filename: path.basename(filenameMatch[1]),
        mimeType: typeMatch ? typeMatch[1].trim() : "application/octet-stream",
        content,
      };
      continue;
    }

    fields[fieldName] = content.toString("utf8").trim();
  }

  return { fields, file };
}

async function sendContactEmail({ name, companyName, email, message }) {
  if (!process.env.SMTP_HOST) {
    return false;
  }

  const recipient = process.env.CONTACT_EMAIL_TO || "hr@talme.in";
  const mailFrom =
    process.env.CONTACT_EMAIL_FROM ||
    process.env.CAREERS_EMAIL_FROM ||
    process.env.SMTP_USER ||
    "no-reply@talme.in";

  await transporter.sendMail({
    from: mailFrom,
    to: recipient,
    replyTo: email,
    subject: `Contact enquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Company: ${companyName}`,
      `Email: ${email}`,
      `Message: ${message}`,
    ].join("\n"),
  });

  return true;
}

async function sendCareerEmail({ fields, file }) {
  if (!process.env.SMTP_HOST || !process.env.CAREERS_EMAIL_TO) {
    return false;
  }

  const mailFrom =
    process.env.CAREERS_EMAIL_FROM || process.env.SMTP_USER || "no-reply@talme.in";

  await transporter.sendMail({
    from: mailFrom,
    to: process.env.CAREERS_EMAIL_TO,
    replyTo: fields.email,
    subject: `Career application: ${fields.fullName} - ${fields.role}`,
    text: [
      `Full name: ${fields.fullName}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone}`,
      `Role: ${fields.role}`,
      `Message: ${fields.message || "N/A"}`,
    ].join("\n"),
    attachments: [
      {
        filename: file.filename,
        content: file.content,
        contentType: file.mimeType,
      },
    ],
  });

  return true;
}

async function sendChatEmail({ name, email, message }) {
  if (!process.env.SMTP_HOST) {
    return false;
  }

  const recipient = process.env.CONTACT_EMAIL_TO || "hr@talme.in";
  const mailFrom =
    process.env.CONTACT_EMAIL_FROM ||
    process.env.CAREERS_EMAIL_FROM ||
    process.env.SMTP_USER ||
    "no-reply@talme.in";

  await transporter.sendMail({
    from: mailFrom,
    to: recipient,
    replyTo: email || undefined,
    subject: `Website chat message from ${name}`,
    text: [`Name: ${name}`, `Email: ${email || "N/A"}`, `Message: ${message}`].join(
      "\n"
    ),
  });

  return true;
}

async function handleContact(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const payload = await readJsonPayload(req);
  const name = payload.name?.trim();
  const companyName = payload.companyName?.trim();
  const email = payload.email?.trim();
  const message = payload.message?.trim();
  const consent = payload.consent === true;

  if (!name || !companyName || !email || !message || !consent) {
    sendJson(res, 400, {
      error: "Name, company, email, message, and consent are required.",
    });
    return;
  }

  const { record, stored, storageError } = await tryAppendRecord("contacts", {
    id: createRecordId("contact"),
    name,
    companyName,
    email,
    message,
    consent,
  });
  let emailed = false;
  let emailError = "";

  try {
    emailed = await sendContactEmail(record);
  } catch (error) {
    emailError = error instanceof Error ? error.message : "Unable to send contact email.";
  }

  if (!stored && !emailed) {
    sendJson(res, 503, {
      error: "Contact backend is not configured for storage or email delivery.",
      details: storageError || emailError,
    });
    return;
  }

  sendJson(res, 200, {
    message:
      stored && emailed
        ? "Contact message stored and sent successfully."
        : emailed
          ? "Contact message sent successfully."
          : "Contact message stored successfully.",
    id: record.id,
    emailed,
    stored,
  });
}

async function handleCareers(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const contentType = getHeader(req, "content-type");
  const boundary = getMultipartBoundary(contentType);

  if (!boundary) {
    sendJson(res, 400, { error: "Invalid form upload request." });
    return;
  }

  const bodyBuffer = await readRequestBody(req, MAX_RESUME_SIZE + 1024 * 1024);
  const { fields, file } = parseMultipartForm(bodyBuffer, boundary);

  if (!fields.fullName || !fields.email || !fields.phone || !fields.role) {
    sendJson(res, 400, {
      error: "Full name, email, phone, and role are required.",
    });
    return;
  }

  if (!file) {
    sendJson(res, 400, { error: "Resume PDF is required." });
    return;
  }

  const isPdf =
    file.mimeType === "application/pdf" ||
    file.filename.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    sendJson(res, 400, { error: "Resume must be uploaded as a PDF file." });
    return;
  }

  if (file.content.length > MAX_RESUME_SIZE) {
    sendJson(res, 400, { error: "Resume must be smaller than 5 MB." });
    return;
  }

  const { record, stored, storageError } = await tryAppendRecord("careers", {
    id: createRecordId("career"),
    fullName: fields.fullName,
    email: fields.email,
    phone: fields.phone,
    role: fields.role,
    message: fields.message || "",
    resume: {
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.content.length,
      contentBase64: file.content.toString("base64"),
    },
  });
  let emailed = false;
  let emailError = "";

  try {
    emailed = await sendCareerEmail({ fields, file });
  } catch (error) {
    emailError = error instanceof Error ? error.message : "Unable to send career email.";
  }

  if (!stored && !emailed) {
    sendJson(res, 503, {
      error: "Careers backend is not configured for storage or email delivery.",
      details: storageError || emailError,
    });
    return;
  }

  sendJson(res, 200, {
    message:
      stored && emailed
        ? "Application stored and sent successfully."
        : emailed
          ? "Application sent successfully."
          : "Application stored successfully.",
    id: record.id,
    emailed,
    stored,
  });
}

async function handleChat(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const payload = await readJsonPayload(req);
  const name = payload.name?.trim() || "Website visitor";
  const email = payload.email?.trim() || "";
  const message = payload.message?.trim();

  if (!message) {
    sendJson(res, 400, { error: "Message is required." });
    return;
  }

  const { record, stored, storageError } = await tryAppendRecord("chatMessages", {
    id: createRecordId("chat"),
    name,
    email,
    message,
  });
  let emailed = false;
  let emailError = "";

  try {
    emailed = await sendChatEmail(record);
  } catch (error) {
    emailError = error instanceof Error ? error.message : "Unable to send chat email.";
  }

  if (!stored && !emailed) {
    sendJson(res, 503, {
      error: "Chat backend is not configured for storage or email delivery.",
      details: storageError || emailError,
    });
    return;
  }

  sendJson(res, 200, {
    message:
      stored && emailed
        ? "Chat message stored and sent successfully."
        : emailed
          ? "Chat message sent successfully."
          : "Chat message stored successfully.",
    id: record.id,
    emailed,
    stored,
  });
}

async function handleData(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const data = await readSiteData();
  sendJson(res, 200, data);
}

export default async function websiteBackend(req, res) {
  if (shouldProxyToBackend(req)) {
    await proxyToBackend(req, res);
    return;
  }

  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url || "/api/backend", "http://localhost");
  const route = url.pathname.replace(/^\/api\/+/, "").split("/")[0];

  try {
    if (route === "contact") {
      await handleContact(req, res);
      return;
    }

    if (route === "careers") {
      await handleCareers(req, res);
      return;
    }

    if (route === "chat") {
      await handleChat(req, res);
      return;
    }

    if (route === "backend" || route === "site-data" || route === "submissions") {
      await handleData(req, res);
      return;
    }

    sendJson(res, 404, { error: "Route not found." });
  } catch (error) {
    if (error instanceof BadRequestError) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (error instanceof StorageConfigError) {
      sendJson(res, 503, { error: error.message });
      return;
    }

    sendJson(res, 500, {
      error: "Failed to process website backend request.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
