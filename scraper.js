const axios = require('axios')
const cheerio = require('cheerio')
const HttpsProxyAgent = require("https-proxy-agent");

function formatNews(source, title, link, time) {
  return { source, title, link, time }
}

async function getCNBCNews() {
  try {
    const HttpsProxyAgent = require("https-proxy-agent");
    const res = await axios.get("https://www.cnbcindonesia.com/market/rss", {
      httpsAgent: agent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml,application/xml",
      },
    });
    const $ = cheerio.load(res.data, { xmlMode: true });

    const news = [];
    $("item").each((i, el) => {
      const title = $(el).find("title").text().trim();
      const link = $(el).find("link").text().trim();
      const time = $(el).find("pubDate").text().trim();
      if (title && link) {
        news.push({
          source: "CNBC Indonesia",
          title,
          link,
          time,
        });
      }
    });

    return news.slice(0, 5);
  } catch (err) {
    console.error("Gagal ambil RSS:", err.message);
    return [];
  }
}

async function getKontanNews() {
  const res = await axios.get('https://investasi.kontan.co.id')
  const $ = cheerio.load(res.data)
  const articles = $('#list-news').find('li')
  const news = []

  articles.each((i, el) => {
    const title = $(el).find('.ket h1 a').text().trim()
    const link = $(el).find('a').attr('href')
    const time = $(el).find('.ket.fs14.ff-opensans .font-gray').text().trim()
    if (title && link) {
      news.push(formatNews('Kontan', title, link, time))
    }
  })

  return news.slice(0, 5)
}

async function getBisnisNews() {
  const res = await axios.get('https://market.bisnis.com/')
  const $ = cheerio.load(res.data)
  const articles = $('div.artItem')
  const news = []

  articles.each((i, el) => {
    const title = $(el).find('.artContent .artLink .artTitle').text().trim()
    const link = $(el).find('.artContent .artLink').attr('href')
    const time = $(el).find('.artContent .artLink .artTitle .artDate').text().trim()
    if (title && link) {
      news.push(formatNews('Bisnis.com', title, link.startsWith('http') ? link : `${link}`, time))
    }
  })

  return news.slice(0, 5)
}

async function getIdxNews() {
  const res = await axios.get('https://www.idxchannel.com/market-news')
  const $ = cheerio.load(res.data)
  const articles = $('.container-news').find('.bt-con')
  const news = []

  articles.each((i, el) => {
    const title = $(el).find('.tab--content .title-capt a').text().trim()
    const link = $(el).find('.tab--content .title-capt a').attr('href')
    const time = $(el).find('.tab--content .headline-date .mh-clock').text().trim()
    if (title && link) {
      news.push(formatNews('idxchannel.com', title, link, time))
    }
  })

  return news.slice(0, 5)
}

// Fungsi utama
async function scrapeAllNews() {
  const [cnbc, kontan, bisnis, idx] = await Promise.all([
    getCNBCNews(),
    getKontanNews(),
    getBisnisNews(),
    getIdxNews(),
  ])

  return [...cnbc, ...kontan, ...bisnis, ...idx]
}

async function scrapeIDXNews() {
  const idx = await getIdxNews()
  return idx
}

async function scrapeKontanNews() {
  const kontan = await getKontanNews()
  return kontan
}

async function scrapeCNBCNews() {
  const cnbc = await getCNBCNews()
  return cnbc
}

async function scrapeBisnisNews() {
  const bisnis = await getBisnisNews()
  return bisnis
}

module.exports = {
  scrapeAllNews,
  scrapeIDXNews,
  scrapeKontanNews,
  scrapeCNBCNews,
  scrapeBisnisNews
}
