import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

process.env.NEWS_STORAGE_PATH ||= path.join(__dirname, "news-storage.json");
process.env.SITE_DATA_STORAGE_PATH ||= path.join(__dirname, "website-storage.json");

const port = process.env.BACKEND_PORT || process.env.NEWS_API_PORT || 3001;
const { newsHandler } = await import("../api/news.js");
const { default: websiteBackend } = await import("../api/[...path].js");

function isNewsRoute(url) {
  return url.pathname === "/api/news" || url.pathname.startsWith("/api/news/");
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Missing request URL." }));
    return;
  }

  const url = new URL(request.url, `http://localhost:${port}`);

  if (isNewsRoute(url)) {
    await newsHandler(request, response);
    return;
  }

  await websiteBackend(request, response);
});

server.listen(port, () => {
  console.log(`Talme backend running on http://localhost:${port}`);
});
