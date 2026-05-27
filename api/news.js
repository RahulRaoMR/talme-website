```js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

let news = [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,x-admin-key"
  );

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET NEWS
  if (req.method === "GET") {
    return res.status(200).json(news);
  }

  // ADD NEWS
  if (req.method === "POST") {
    try {
      let title = "";
      let summary = "";
      let isoDate = "";
      let imageUrl = "";

      // Handle JSON request
      if (req.headers["content-type"]?.includes("application/json")) {
        title = req.body.title;
        summary = req.body.summary;
        isoDate = req.body.isoDate;
        imageUrl = req.body.imageUrl || "";
      } else {
        // Handle multipart/form-data fallback
        title = req.body?.title || "";
        summary = req.body?.summary || "";
        isoDate = req.body?.isoDate || "";
      }

      if (!title || !summary || !isoDate) {
        return res.status(400).json({
          error: "Title, summary and date are required",
        });
      }

      const newItem = {
        id: `news-${Date.now()}`,
        title,
        summary,
        isoDate,
        imageUrl,
      };

      news.unshift(newItem);

      return res.status(201).json({
        success: true,
        item: newItem,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: error.message || "Internal Server Error",
      });
    }
  }

  // DELETE NEWS
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      news = news.filter((item) => item.id !== id);

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Internal Server Error",
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed",
  });
}
```
