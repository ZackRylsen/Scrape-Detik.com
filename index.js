const express = require("express");
const NodeCache = require("node-cache");
const getLatestNews = require("./scrape/detik");

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // cache 10 menit
const PORT = 3000;

app.get("/api/news/detik", async (req, res) => {
  try {
    const cached = cache.get("detik-news");
    if (cached) {
      return res.json({
        source: "detik.com",
        cached: true,
        total: cached.length,
        data: cached
      });
    }

    const news = await getLatestNews(5);
    cache.set("detik-news", news);

    res.json({
      source: "detik.com",
      cached: false,
      total: news.length,
      data: news
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});