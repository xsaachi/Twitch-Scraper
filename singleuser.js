require('dotenv').config();
const tmi = require('tmi.js');
const mongoose = require('mongoose');

// Mongoose setup
mongoose.connect(process.env.MONGO_URI);
const ChatMessage = mongoose.model('#username', {
  channel: String,
  username: String,
  message: String,
});

// Twitch bot setup
const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD,
  },
  channels: [process.env.TWITCH_CHANNEL],
});

client.connect();

client.on('message', async (channel, userstate, message, self) => {
  if (self) return; // Ignore messages from the bot itself

  // Save message to MongoDB Atlas
  const chatMessage = new ChatMessage({
    channel,
    username: userstate.username,
    message,
  });

  try {
    await chatMessage.save();
    console.log('Message saved to MongoDB Atlas:', message);
  } catch (err) {
    console.error('Error saving message:', err);
  }
});

// Event listeners for connection and errors
client.on('connected', () => {
  console.log(`Connected to ${process.env.TWITCH_CHANNEL}'s chat`);
});

client.on('disconnected', (reason) => {
  console.log(`Disconnected: ${reason}`);
});

client.on('error', (err) => {
  console.error('Error:', err);
});