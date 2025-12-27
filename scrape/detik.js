const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Accept-Language": "id-ID,id;q=0.9"
};

// ambil link berita terbaru
async function getLatestLinks(limit = 5) {
  const { data } = await axios.get("https://news.detik.com/", {
    headers: HEADERS
  });

  const $ = cheerio.load(data);
  const links = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (
      href &&
      href.startsWith("https://news.detik.com/berita/") &&
      text.length > 30
    ) {
      links.push({ judul: text, link: href });
    }
  });

  // remove duplicate
  return Array.from(
    new Map(links.map(i => [i.link, i])).values()
  ).slice(0, limit);
}

// ambil detail berita
async function getDetail(link) {
  const { data } = await axios.get(link, {
    headers: HEADERS
  });

  const $ = cheerio.load(data);

  return {
    judul: $("h1").first().text().trim(),
    link,
    thumbnail: $('meta[property="og:image"]').attr("content"),
    tanggal: $('meta[property="article:published_time"]').attr("content"),
    kategori: $('meta[property="article:section"]').attr("content"),
    deskripsi: $('meta[name="description"]').attr("content"),
    source: "detik.com"
  };
}

async function getLatestNews(limit = 5) {
  const links = await getLatestLinks(limit);
  const result = [];

  for (const item of links) {
    const detail = await getDetail(item.link);
    result.push(detail);
  }

  return result;
}

module.exports = getLatestNews;