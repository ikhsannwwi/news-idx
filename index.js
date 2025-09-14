require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const cron = require('node-cron')
const { scrapeAllNews } = require('./scraper')

// === Konfigurasi ===
const token = process.env.TELEGRAM_TOKEN
const chatId = process.env.CHAT_ID // ID grup
const groupId = process.env.GROUP_ID // ID grup
const topicId = process.env.TOPIC_ID // ID topik (kalau mau fixed ke topik tertentu)

// Buat bot
const bot = new TelegramBot(token, { polling: true })

bot.on('message', (msg) => {
    console.log(msg)
  })

  bot.onText(/\/topicid/, (msg) => {
    if (msg.message_thread_id) {
      bot.sendMessage(
        msg.chat.id,
        `🧵 Topic ID kamu: \`${msg.message_thread_id}\``,
        { parse_mode: "Markdown" }
      )
    } else {
      bot.sendMessage(msg.chat.id, "❌ Perintah ini cuma bisa dipakai di dalam topik forum (supergroup).")
    }
  })

// Fungsi untuk ambil berita & kirim ke chat/topik
async function sendNews(targetChatId, threadId = null) {
  try {
    const news = await scrapeAllNews()
    let text = "📢 *Berita Pasar Terbaru:*\n\n"

    news.forEach((n, i) => {
      text += `${i + 1}. [${n.title}](${n.link})\n📰 ${n.source} | ⏰ ${n.time}\n\n`
    })

    const options = { parse_mode: "Markdown" }
    if (threadId) options.message_thread_id = threadId

    await bot.sendMessage(targetChatId, text, options)
  } catch (err) {
    console.error("Gagal ambil berita:", err)
    await bot.sendMessage(targetChatId, "❌ Gagal mengambil berita.")
  }
}

// === Command manual ===
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Halo! Kirim /news untuk dapat berita terbaru 📈")
})

bot.onText(/\/news/, async (msg) => {
  const id = msg.chat.id
  const threadId = msg.message_thread_id // kalau perintah diketik di dalam topik
  bot.sendMessage(id, "🔎 Sedang mengambil berita...", {
    message_thread_id: threadId
  })
  await sendNews(id, threadId)
})

// === Cron otomatis ===
// kirim tiap jam 7 pagi ke grup + topik tertentu
cron.schedule('0 7 * * *', () => {
  console.log("⏰ Cron jalan, kirim berita ke topik...")
  sendNews(groupId, topicId)
})
