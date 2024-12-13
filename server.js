import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { setWsHeartbeat } from 'ws-heartbeat/server.js'
import * as TelegramBot from 'node-telegram-bot-api'
import nodepersist from 'node-persist'

dotenv.config()
const LocalStorage = nodepersist.LocalStorage
const pstor = new LocalStorage()
await pstor.init()

const uri = process.env.DB_CONNECTION_STRING
const client = new MongoClient(uri)
const port = process.env.PORT
const tgBot = new TelegramBot(process.env.TG_BOT_TOKEN, { polling: true })

const app = express()
let wsServer = new WebSocketServer({ port: 3005 })

function tg_report(msg) { 
  const userName = msg.name
  const displayTimestamp = (new Date(msg.timestamp)).toLocaleString('ru-UA', { timezone: 'Europe/Kyiv' })
  const msgText = msg.text
  return `🧍‍♂️ **${userName}**\n🕒 *${displayTimestamp}*\n\n\`${msgText}\``
}

app.use(cors({ origin: process.env.FRONTEND_DOMAIN }))

app.get('/get_posts', async (req, res) => {
  const collection = client.db().collection('Posts')
  const allPosts = await collection.find().toArray()
  res.json(allPosts.sort((a, b) => b.timestamp - a.timestamp))
})

app.get('/send_post', async (req, res) => {
  const post = {
    name: req.query.name,
    text: req.query.text,
    timestamp: Date.now(),
  }
  const collection = client.db().collection('Posts')
  const { insertedId } = await collection.insertOne(post)
  const newPost = {
    _id: insertedId,
    name: post.name,
    text: post.text,
    timestamp: post.timestamp
  }
  wsServer.clients.forEach(ws => ws.send(JSON.stringify(newPost)))
  res.send()

  let ownerChatId = await pstor.getItem('tg_chat_id')
  if (ownerChatId) {
    tgBot.sendMessage(ownerChatId, tg_report(newPost), { parse_mode: 'MarkdownV2' })
  }
})

app.use((req, res) => {
  res.status(404).send('Oops something going wrong :{')
})

client.connect(() => {
  const server = app.listen(port, '0.0.0.0')
  wsServer = new WebSocketServer({ server })
  setWsHeartbeat(wsServer, (ws, data) => {
    console.log(data.toString())
    if (data.toString() === '{"kind":"ping"}') {
        ws.send('{"kind":"pong"}')
    }
  }, 60000)
  console.log(`Server is running on port ${port}`)
})

app.on('close', () => {
  client.close()
  wsServer.close()
})

tgBot.on('message', (msg) => {
  if (msg.from.username.includes(process.env.TG_BOT_OWNER)) {
    pstor.setItem('tg_chat_id', msg.chat.id)
    tgBot.deleteMessage(msg.chat.id, msg.message_id)
  }
})