import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import WebSocket from 'ws'

dotenv.config()

const uri = process.env.DB_CONNECTION_STRING
const client = new MongoClient(uri, { useNewUrlParser: true })
const port = process.env.PORT

const app = express()
let wsServer = new WebSocket.Server({ port: 3005 })

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
  let newPost = {}
  try {
    const { insertedId } = await collection.insertOne(post)
    newPost = {
      _id: insertedId,
      name: post.name,
      text: post.text,
      timestamp: post.timestamp
    }
  } catch (error) {
    console.log(error)
  }
  wsServer.clients.forEach(ws => ws.send(JSON.stringify(newPost)))
  res.send()
})

app.use((req, res) => {
  res.status(404).send('Oops something going wrong :{')
})

client.connect(() => {
  const server = app.listen(port, '0.0.0.0')
  wsServer = new WebSocket.Server({ server })
  console.log(`Server is running on port ${port}`)
})

app.on('close', () => {
  client.close()
  wsServer.close()
})