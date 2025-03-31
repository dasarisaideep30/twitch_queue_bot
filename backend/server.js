require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const tmi = require("tmi.js"); // Use tmi.js instead of twitch-bot

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"));

// Video Schema
const VideoSchema = new mongoose.Schema({
  username: String,
  videoLink: String,
  timestamp: { type: Date, default: Date.now }
});
const Video = mongoose.model("Video", VideoSchema);

// API Routes
app.get("/queue", async (req, res) => {
  const queue = await Video.find().sort("timestamp");
  res.json(queue);
});

app.post("/queue", async (req, res) => {
  const { username, videoLink } = req.body;
  const newVideo = new Video({ username, videoLink });
  await newVideo.save();
  io.emit("queueUpdated"); // Notify clients
  res.status(201).json(newVideo);
});

app.delete("/queue/:id", async (req, res) => {
  await Video.findByIdAndDelete(req.params.id);
  io.emit("queueUpdated");
  res.sendStatus(204);
});

// ✅ Twitch Bot Setup (tmi.js)
const client = new tmi.Client({
  options: { debug: true },
  connection: { reconnect: true },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME, 
    password: process.env.TWITCH_OAUTH // Get from https://twitchapps.com/tmi/
  },
  channels: [process.env.TWITCH_CHANNEL]
});

client.connect();

client.on("message", async (channel, tags, message, self) => {
  if (self) return; // Ignore bot's own messages

  if (message.includes("https://")) {
    await new Video({ username: tags.username, videoLink: message }).save();
    io.emit("queueUpdated");
    client.say(channel, `@${tags.username}, your video has been added to the queue!`);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));