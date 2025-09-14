const axios = require('axios')
const cheerio = require('cheerio')

function formatNews(source, title, link, time) {
  return { source, title, link, time }
}

async function getCNBCNews() {
  const res = await axios.get('https://www.cnbcindonesia.com/market')
  const $ = cheerio.load(res.data)
  const articles = $('article a.group.flex')
  const news = []

  articles.each((i, el) => {
    const title = $(el).find('h2').text().trim()
    const link = $(el).attr('href')
    const time = $(el).find('.text-gray').text().trim()
    if (title && link) {
      news.push(formatNews('CNBC Indonesia', title, link, time))
    }
  })

  return news.slice(0, 5)
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
