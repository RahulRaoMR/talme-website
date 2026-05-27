  import { Buffer } from "node:buffer";
  import { createServer } from "node:http";
  import { readFile, writeFile } from "node:fs/promises";
  import path from "node:path";
  import process from "node:process";
  import { fileURLToPath } from "node:url";
  import dotenv from "dotenv";
  import nodemailer from "nodemailer";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  const storagePath = path.join(__dirname, "news-storage.json");
  const port = process.env.NEWS_API_PORT || 3001;
  const MAX_RESUME_SIZE = 5 * 1024 * 1024;
  const MAX_NEWS_IMAGE_SIZE = 8 * 1024 * 1024;

  class BadRequestError extends Error {}

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

  function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,x-admin-key",
    });
    response.end(JSON.stringify(payload));
  }

  function requireNewsAdmin(request, response) {
    const configuredKey = process.env.NEWS_ADMIN_KEY;
    const requestKey = request.headers["x-admin-key"];

    if (!configuredKey) {
      sendJson(response, 500, { error: "News admin key is not configured." });
      return false;
    }

    if (requestKey !== configuredKey) {
      sendJson(response, 401, { error: "Invalid admin key." });
      return false;
    }

    return true;
  }

  async function readNews() {
    const raw = await readFile(storagePath, "utf8");
    return JSON.parse(raw);
  }

  async function writeNews(items) {
    await writeFile(storagePath, JSON.stringify(items, null, 2));
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
          fieldName,
          filename: path.basename(filenameMatch[1]),
          mimeType: typeMatch ? typeMatch[1].trim() : "application/octet-stream",
          content: content,
        };
        continue;
      }

      fields[fieldName] = content.toString("utf8").trim();
    }

    return { fields, file };
  }

  async function readRequestBody(request, maxSize) {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
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

  async function readJsonBody(request) {
    let body = "";

    for await (const chunk of request) {
      body += chunk;
    }

    return JSON.parse(body || "{}");
  }

  async function readNewsPayload(request) {
    const contentType = request.headers["content-type"] || "";

    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return readJsonBody(request);
    }

    const boundary = getMultipartBoundary(contentType);
    if (!boundary) {
      throw new BadRequestError("Invalid news upload request.");
    }

    const bodyBuffer = await readRequestBody(request, MAX_NEWS_IMAGE_SIZE + 1024 * 1024);
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

  async function handleCareersSubmission(request, response) {
    const contentType = request.headers["content-type"] || "";
    const boundary = getMultipartBoundary(contentType);

    if (!boundary) {
      sendJson(response, 400, { error: "Invalid form upload request." });
      return;
    }

    const bodyBuffer = await readRequestBody(request, MAX_RESUME_SIZE + 1024 * 1024);
    const { fields, file } = parseMultipartForm(bodyBuffer, boundary);

    if (!fields.fullName || !fields.email || !fields.phone || !fields.role) {
      sendJson(response, 400, {
        error: "Full name, email, phone, and role are required.",
      });
      return;
    }

    if (!file) {
      sendJson(response, 400, { error: "Resume PDF is required." });
      return;
    }

    const isPdf =
      file.mimeType === "application/pdf" ||
      file.filename.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      sendJson(response, 400, { error: "Resume must be uploaded as a PDF file." });
      return;
    }

    if (file.content.length > MAX_RESUME_SIZE) {
      sendJson(response, 400, { error: "Resume must be smaller than 5 MB." });
      return;
    }

    if (!process.env.SMTP_HOST || !process.env.CAREERS_EMAIL_TO) {
      sendJson(response, 500, {
        error: "Careers email server is not configured.",
      });
      return;
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

    sendJson(response, 200, { message: "Application submitted successfully." });
  }

  async function handleContactSubmission(request, response) {
    let body = "";
    for await (const chunk of request) {
      body += chunk;
    }

    const payload = JSON.parse(body || "{}");
    const name = payload.name?.trim();
    const companyName = payload.companyName?.trim();
    const email = payload.email?.trim();
    const message = payload.message?.trim();
    const consent = payload.consent === true;

    if (!name || !companyName || !email || !message || !consent) {
      sendJson(response, 400, {
        error: "Name, company, email, message, and consent are required.",
      });
      return;
    }

    if (!process.env.SMTP_HOST) {
      sendJson(response, 500, {
        error: "Contact email server is not configured.",
      });
      return;
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

    sendJson(response, 200, { message: "Contact message sent successfully." });
  }

  const server = createServer(async (request, response) => {
    if (!request.url) {
      sendJson(response, 400, { error: "Missing request URL." });
      return;
    }

    const { method } = request;
    const url = new URL(request.url, `http://localhost:${port}`);

    if (method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,x-admin-key",
      });
      response.end();
      return;
    }

    if (
      !(
        url.pathname === "/api/careers" ||
        url.pathname === "/api/contact" ||
        url.pathname === "/api/news" ||
        url.pathname.startsWith("/api/news/")
      )
    ) {
      sendJson(response, 404, { error: "Route not found." });
      return;
    }

    try {
      if (url.pathname === "/api/careers") {
        if (method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }

        await handleCareersSubmission(request, response);
        return;
      }

      if (url.pathname === "/api/contact") {
        if (method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed." });
          return;
        }

        await handleContactSubmission(request, response);
        return;
      }

      if (url.pathname === "/api/news" && method === "GET") {
        if (request.headers["x-admin-key"] && !requireNewsAdmin(request, response)) {
          return;
        }

        const items = await readNews();
        sendJson(response, 200, sortByDateDescending(items));
        return;
      }

      if (url.pathname === "/api/news" && method === "POST") {
        if (!requireNewsAdmin(request, response)) {
          return;
        }

        const payload = await readNewsPayload(request);
        const title = payload.title?.trim();
        const summary = payload.summary?.trim();
        const isoDate = payload.isoDate?.trim();

        if (!title || !summary || !isoDate) {
          sendJson(response, 400, { error: "Title, summary, and date are required." });
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

        const updatedItems = sortByDateDescending([newItem, ...items]);
        await writeNews(updatedItems);
        sendJson(response, 201, newItem);
        return;
      }

      if (url.pathname.startsWith("/api/news/") && method === "PUT") {
        if (!requireNewsAdmin(request, response)) {
          return;
        }

        const payload = await readNewsPayload(request);
        const title = payload.title?.trim();
        const summary = payload.summary?.trim();
        const isoDate = payload.isoDate?.trim();

        if (!title || !summary || !isoDate) {
          sendJson(response, 400, { error: "Title, summary, and date are required." });
          return;
        }

        const itemId = decodeURIComponent(url.pathname.replace("/api/news/", ""));
        const items = await readNews();
        const itemIndex = items.findIndex((item) => item.id === itemId);

        if (itemIndex === -1) {
          sendJson(response, 404, { error: "News item not found." });
          return;
        }

        const updatedItem = {
          ...items[itemIndex],
          title,
          summary,
          isoDate,
          date: formatDisplayDate(isoDate),
          imageUrl: payload.removeImage
            ? ""
            : payload.imageUrl || items[itemIndex].imageUrl || "",
        };

        const nextItems = [...items];
        nextItems[itemIndex] = updatedItem;
        await writeNews(sortByDateDescending(nextItems));
        sendJson(response, 200, updatedItem);
        return;
      }

      if (url.pathname.startsWith("/api/news/") && method === "DELETE") {
        if (!requireNewsAdmin(request, response)) {
          return;
        }

        const itemId = decodeURIComponent(url.pathname.replace("/api/news/", ""));
        const items = await readNews();
        const nextItems = items.filter((item) => item.id !== itemId);

        if (nextItems.length === items.length) {
          sendJson(response, 404, { error: "News item not found." });
          return;
        }

        await writeNews(nextItems);
        sendJson(response, 200, { message: "News item deleted successfully." });
        return;
      }

      sendJson(response, 405, { error: "Method not allowed." });
    } catch (error) {
      if (error instanceof BadRequestError) {
        sendJson(response, 400, { error: error.message });
        return;
      }

      sendJson(response, 500, {
        error:
          url.pathname === "/api/careers"
            ? "Failed to process careers request."
            : url.pathname === "/api/contact"
              ? "Failed to process contact request."
              : "Failed to process news request.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  server.listen(port, () => {
    console.log(`News API running on http://localhost:${port}`);
  });
