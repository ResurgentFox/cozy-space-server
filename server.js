import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const uri = process.env.DB_CONNECTION_STRING
console.log(uri)
const client = new MongoClient(uri)
const port = process.env.PORT

const app = express()
app.get('/get_posts', async (req, res) => {
  const collection = client.db().collection('Posts')
  const allPosts = await collection.find().toArray()
  res.json(allPosts)
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