```js
import fs from "fs";
import path from "path";

const storagePath = path.join(process.cwd(), "server", "news-storage.json");

function readNews() {
  try {
    const data = fs.readFileSync(storagePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeNews(news) {
  fs.writeFileSync(storagePath, JSON.stringify(news, null, 2));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,x-admin-key"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET NEWS
  if (req.method === "GET") {
    const news = readNews();
    return res.status(200).json(news);
  }

  // ADD NEWS
  if (req.method === "POST") {
    try {
      const { title, summary, isoDate, imageUrl } = req.body;

      if (!title || !summary || !isoDate) {
        return res.status(400).json({
          error: "Title, summary and date are required",
        });
      }

      const news = readNews();

      const newItem = {
        id: `news-${Date.now()}`,
        title,
        summary,
        isoDate,
        imageUrl: imageUrl || "",
      };

      news.unshift(newItem);

      writeNews(news);

      return res.status(201).json({
        success: true,
        item: newItem,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  // DELETE NEWS
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      const news = readNews();
      const filtered = news.filter((item) => item.id !== id);

      writeNews(filtered);

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed",
  });
}
```
