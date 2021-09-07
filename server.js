import { Posts } from "./data/data.js";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import express from "express";

dotenv.config();

const port = process.env.PORT;
const posts = new Posts();

const app = express();
app.get("/get_posts", (req, res) => {
  res.send(posts.getPosts());
});

app.get("/send_post", (req, res) => {
  const post = {
    key: Math.random(),
    name: req.query.name,
    text: req.query.text,
    date: Date.now(),
  };
  console.log(post);
  res.json();
});

app.use((req, res) => {
  res.status(404).send("Oops something going wrong :{");
});

app.listen(port, "127.0.0.1");
