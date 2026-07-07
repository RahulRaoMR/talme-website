import { Buffer } from "node:buffer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundledStoragePath = path.resolve(__dirname, "../server/news-storage.json");
const tmpStoragePath = path.join(os.tmpdir(), "talme-news-storage.json");
const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
);
const isHostedRuntime = Boolean(
  isServerlessRuntime ||
    process.env.RENDER ||
    process.env.RENDER_SERVICE_ID
);
const writableStoragePath =
  process.env.NEWS_STORAGE_PATH ||
  (isHostedRuntime ? bundledStoragePath : tmpStoragePath);
const remoteStorageUrl =
  process.env.NEWS_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  "";
const remoteStorageToken =
  process.env.NEWS_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "";
const remoteStorageKey = process.env.NEWS_STORAGE_KEY || "talme:news";
const databaseStorageUrl =
  process.env.NEWS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.NEON_DATABASE_URL ||
  "";
const databaseStorageKey = process.env.NEWS_DATABASE_STORAGE_KEY || remoteStorageKey;
const MAX_NEWS_IMAGE_SIZE = 8 * 1024 * 1024;
const backendProxyOrigin = (
  process.env.TALME_BACKEND_ORIGIN ||
  process.env.NEWS_BACKEND_ORIGIN ||
  ""
).replace(/\/+$/, "");

export const config = {
  api: {
    bodyParser: false,
  },
};

class BadRequestError extends Error {}
class StorageConfigError extends Error {}

let databaseSql;
let databaseReadyPromise;

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
  const requestUrl = new URL(req.url || "/api/news", "http://localhost");
  const targetUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, backendProxyOrigin);
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await readRequestBody(req, MAX_NEWS_IMAGE_SIZE + 1024 * 1024);
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

function hasRemoteStorage() {
  return Boolean(remoteStorageUrl && remoteStorageToken);
}

function hasDatabaseStorage() {
  return Boolean(databaseStorageUrl);
}

function hasDurableFileStorage() {
  return !isHostedRuntime;
}

function getStorageMode() {
  if (hasDatabaseStorage()) {
    return "database";
  }

  if (hasRemoteStorage()) {
    return "remote";
  }

  return hasDurableFileStorage() ? "local" : "readonly";
}

function getStorageSetupMessage() {
  return "Live news editing needs persistent storage. Add DATABASE_URL/Neon or Upstash REST credentials, then redeploy.";
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);

  if (typeof res.setHeader === "function") {
    res.setHeader("X-News-Storage-Mode", getStorageMode());
  }

  if (typeof res.status === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-key");
  res.setHeader("Access-Control-Expose-Headers", "X-News-Storage-Mode");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.end(body);
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-key");
  res.setHeader("Access-Control-Expose-Headers", "X-News-Storage-Mode");
  res.setHeader("X-News-Storage-Mode", getStorageMode());
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

function getHeader(req, name) {
  const headers = req.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function getConfiguredAdminKeys() {
  return [process.env.NEWS_ADMIN_KEY, process.env.SITE_ADMIN_KEY].filter(Boolean);
}

function requireNewsAdmin(req, res) {
  const configuredKeys = getConfiguredAdminKeys();
  const requestKey = getHeader(req, "x-admin-key");

  if (configuredKeys.length === 0) {
    sendJson(res, 500, { error: "News admin key is not configured." });
    return false;
  }

  if (!configuredKeys.includes(requestKey)) {
    sendJson(res, 401, { error: "Invalid admin key." });
    return false;
  }

  return true;
}

function formatDisplayDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function createNewsId() {
  return `news-${Date.now()}`;
}

function sortByDateDescending(items) {
  return [...items].sort((left, right) => {
    return new Date(right.isoDate).getTime() - new Date(left.isoDate).getTime();
  });
}

async function ensureStorageFile(storagePath) {
  try {
    await readFile(storagePath, "utf8");
    return storagePath;
  } catch {
    await mkdir(path.dirname(storagePath), { recursive: true });

    try {
      const bundledNews = await readFile(bundledStoragePath, "utf8");
      await writeFile(storagePath, bundledNews);
    } catch {
      await writeFile(storagePath, "[]");
    }

    return storagePath;
  }
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
    throw new Error(result.error || "Unable to access remote news storage.");
  }

  return result.result;
}

function getDatabaseSql() {
  databaseSql ||= neon(databaseStorageUrl);
  return databaseSql;
}

async function ensureDatabaseStorage() {
  databaseReadyPromise ||= getDatabaseSql()`
    CREATE TABLE IF NOT EXISTS talme_app_storage (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await databaseReadyPromise;
}

function normalizeStoredArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [];
  }

  return [];
}

async function readDatabaseNews() {
  await ensureDatabaseStorage();

  const rows = await getDatabaseSql()`
    SELECT value
    FROM talme_app_storage
    WHERE key = ${databaseStorageKey}
    LIMIT 1
  `;

  if (rows.length === 0) {
    const seedItems = await readFileNews();
    await writeDatabaseNews(seedItems);
    return seedItems;
  }

  return normalizeStoredArray(rows[0].value);
}

async function writeDatabaseNews(items) {
  await ensureDatabaseStorage();

  await getDatabaseSql()`
    INSERT INTO talme_app_storage (key, value, updated_at)
    VALUES (${databaseStorageKey}, ${JSON.stringify(items)}::jsonb, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

async function readFileNews() {
  try {
    const storagePath = await ensureStorageFile(writableStoragePath);
    const raw = await readFile(storagePath, "utf8");
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    const storagePath = await ensureStorageFile(tmpStoragePath);
    const raw = await readFile(storagePath, "utf8");
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  }
}

async function writeFileNews(items) {
  const serializedItems = JSON.stringify(items, null, 2);

  try {
    const storagePath = await ensureStorageFile(writableStoragePath);
    await writeFile(storagePath, serializedItems);
  } catch {
    const storagePath = await ensureStorageFile(tmpStoragePath);
    await writeFile(storagePath, serializedItems);
  }
}

async function readRemoteNews() {
  const raw = await runRemoteStorageCommand(["GET", remoteStorageKey]);

  if (!raw) {
    const seedItems = await readFileNews();
    await writeRemoteNews(seedItems);
    return seedItems;
  }

  const items = JSON.parse(raw);
  return Array.isArray(items) ? items : [];
}

async function writeRemoteNews(items) {
  await runRemoteStorageCommand(["SET", remoteStorageKey, JSON.stringify(items)]);
}

async function readNews() {
  if (hasDatabaseStorage()) {
    try {
      return await readDatabaseNews();
    } catch {
      if (!hasRemoteStorage()) {
        throw new StorageConfigError(getStorageSetupMessage());
      }
    }
  }

  if (hasRemoteStorage()) {
    try {
      return await readRemoteNews();
    } catch {
      return readFileNews();
    }
  }

  return readFileNews();
}

async function writeNews(items) {
  if (hasDatabaseStorage()) {
    try {
      await writeDatabaseNews(items);
      return;
    } catch {
      if (!hasRemoteStorage()) {
        throw new StorageConfigError(getStorageSetupMessage());
      }
    }
  }

  if (hasRemoteStorage()) {
    try {
      await writeRemoteNews(items);
      return;
    } catch {
      if (!hasDurableFileStorage()) {
        throw new StorageConfigError(getStorageSetupMessage());
      }

      await writeFileNews(items);
      return;
    }
  }

  if (!hasDurableFileStorage()) {
    throw new StorageConfigError(getStorageSetupMessage());
  }

  await writeFileNews(items);
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

async function readRequestBody(req, maxSize) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxSize) {
      throw new BadRequestError("Uploaded file is too large.");
    }

    return req.body;
  }

  if (typeof req.body === "string") {
    const bodyBuffer = Buffer.from(req.body);
    if (bodyBuffer.length > maxSize) {
      throw new BadRequestError("Uploaded file is too large.");
    }

    return bodyBuffer;
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bufferChunk.length;

    if (size > maxSize) {
      throw new BadRequestError("Uploaded file is too large.");
    }

    chunks.push(bufferChunk);
  }

  return Buffer.concat(chunks);
}

function getMultipartBoundary(contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return boundaryMatch ? boundaryMatch[1] || boundaryMatch[2] : "";
}

async function readJsonPayload(req) {
  if (req.body && !Buffer.isBuffer(req.body) && typeof req.body === "object") {
    return req.body;
  }

  const bodyBuffer = await readRequestBody(req, 1024 * 1024);
  const bodyText = bodyBuffer.toString("utf8");
  return bodyText ? JSON.parse(bodyText) : {};
}

async function readNewsPayload(req) {
  const contentType = getHeader(req, "content-type");

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return readJsonPayload(req);
  }

  const boundary = getMultipartBoundary(contentType);
  if (!boundary) {
    throw new BadRequestError("Invalid news upload request.");
  }

  const bodyBuffer = await readRequestBody(req, MAX_NEWS_IMAGE_SIZE + 1024 * 1024);
  const { fields, file } = parseMultipartForm(bodyBuffer, boundary);
  const payload = {
    title: fields.title,
    summary: fields.summary,
    isoDate: fields.isoDate,
    removeImage: fields.removeImage === "true",
  };

  if (file) {
    const isImage =
      file.mimeType.startsWith("image/") ||
      /\.(jpe?g|png|gif|webp)$/i.test(file.filename);

    if (!isImage) {
      throw new BadRequestError("News image must be an image file.");
    }

    if (file.content.length > MAX_NEWS_IMAGE_SIZE) {
      throw new BadRequestError("News image must be smaller than 8 MB.");
    }

    payload.imageUrl = `data:${file.mimeType};base64,${file.content.toString("base64")}`;
  }

  return payload;
}

function getItemId(req) {
  if (req.query?.id) {
    return Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  }

  const url = new URL(req.url || "/api/news", "http://localhost");
  const queryId = url.searchParams.get("id");

  if (queryId) {
    return queryId;
  }

  const [, itemId] = url.pathname.match(/^\/api\/news\/([^/]+)$/) || [];
  return itemId ? decodeURIComponent(itemId) : "";
}

async function handleGetNews(req, res) {
  if (getHeader(req, "x-admin-key") && !requireNewsAdmin(req, res)) {
    return;
  }

  const items = await readNews();
  sendJson(res, 200, sortByDateDescending(items));
}

async function handleCreateNews(req, res) {
  if (!requireNewsAdmin(req, res)) {
    return;
  }

  const payload = await readNewsPayload(req);
  const title = payload.title?.trim();
  const summary = payload.summary?.trim();
  const isoDate = payload.isoDate?.trim();

  if (!title || !summary || !isoDate) {
    sendJson(res, 400, { error: "Title, summary, and date are required." });
    return;
  }

  const items = await readNews();
  const newItem = {
    id: createNewsId(),
    title,
    summary,
    isoDate,
    date: formatDisplayDate(isoDate),
    imageUrl: payload.imageUrl || "",
  };

  await writeNews(sortByDateDescending([newItem, ...items]));
  sendJson(res, 201, newItem);
}

async function handleUpdateNews(req, res) {
  if (!requireNewsAdmin(req, res)) {
    return;
  }

  const itemId = getItemId(req);
  if (!itemId) {
    sendJson(res, 400, { error: "News item id is required." });
    return;
  }

  const payload = await readNewsPayload(req);
  const title = payload.title?.trim();
  const summary = payload.summary?.trim();
  const isoDate = payload.isoDate?.trim();

  if (!title || !summary || !isoDate) {
    sendJson(res, 400, { error: "Title, summary, and date are required." });
    return;
  }

  const items = await readNews();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    sendJson(res, 404, { error: "News item not found." });
    return;
  }

  const updatedItem = {
    ...items[itemIndex],
    title,
    summary,
    isoDate,
    date: formatDisplayDate(isoDate),
    imageUrl: payload.removeImage ? "" : payload.imageUrl || items[itemIndex].imageUrl || "",
  };
  const nextItems = [...items];
  nextItems[itemIndex] = updatedItem;

  await writeNews(sortByDateDescending(nextItems));
  sendJson(res, 200, updatedItem);
}

async function handleDeleteNews(req, res) {
  if (!requireNewsAdmin(req, res)) {
    return;
  }

  const itemId = getItemId(req);
  if (!itemId) {
    sendJson(res, 400, { error: "News item id is required." });
    return;
  }

  const items = await readNews();
  const nextItems = items.filter((item) => item.id !== itemId);

  if (nextItems.length === items.length) {
    sendJson(res, 404, { error: "News item not found." });
    return;
  }

  await writeNews(nextItems);
  sendJson(res, 200, { message: "News item deleted successfully." });
}

export async function newsHandler(req, res) {
  if (shouldProxyToBackend(req)) {
    await proxyToBackend(req, res);
    return;
  }

  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  try {
    if (req.method === "GET") {
      await handleGetNews(req, res);
      return;
    }

    if (req.method === "POST") {
      await handleCreateNews(req, res);
      return;
    }

    if (req.method === "PUT") {
      await handleUpdateNews(req, res);
      return;
    }

    if (req.method === "DELETE") {
      await handleDeleteNews(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
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
      error: "Failed to process news request.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export default newsHandler;
