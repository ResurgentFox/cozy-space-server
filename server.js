import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

dotenv.config()

const uri = process.env.DB_CONNECTION_STRING
const client = new MongoClient(uri)
const port = process.env.PORT

const app = express()
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
  await collection.insertOne(post)
  res.send()
})

app.use((req, res) => {
  res.status(404).send('Oops something going wrong :{')
})

client.connect(() => {
  app.listen(port, '127.0.0.1')
  console.log('Server is running')
})