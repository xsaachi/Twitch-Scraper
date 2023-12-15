require('dotenv').config();
const tmi = require('tmi.js');
const mongoose = require('mongoose');
const fs = require('fs');

// Function to create a connection and model for a channel
const connectToChannelDB = async (channelName) => {
  // Create a unique connection URI for each channel
  const channelDBConnection = mongoose.createConnection(`${process.env.MONGO_URI}`);

  // Define model for the channel's chat messages
  const ChannelChatMessage = channelDBConnection.model(`${channelName}`, {
    channel: String,
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  });

  // Return model for the channel's chat messages
  return ChannelChatMessage;
};

const vtubersData = JSON.parse(fs.readFileSync('plvtubers.json', 'utf8')).vtubers;

// Twitch bot setup
const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD,
  },
  channels: vtubersData, // Initialize an empty array for storing channels
});

client.connect();

// Map to store ChannelChatMessage models for each channel
const channelModels = new Map();

client.on('message', async (channel, userstate, message, self) => {
  if (self) return; // Ignore messages from the bot itself
  if (userstate['message-type'] === 'whisper') return; // Ignore whispers

  let channelModel = channelModels.get(channel);

  // If model for the channel doesn't exist, create it and store it in the map
  if (!channelModel) {
    channelModel = await connectToChannelDB(channel);
    channelModels.set(channel, channelModel);
  }

  // Save message to the respective channel's MongoDB Atlas database
  const chatMessage = new channelModel({
    channel,
    username: userstate.username,
    message,
  });

  try {
    await chatMessage.save();
    console.log(`Message saved to ${channel}'s MongoDB Atlas database: ${message}`);
  } catch (err) {
    console.error('Error saving message:', err);
  }
});

// Event listener for successful connection to a channel
client.on('join', (channel, username, self) => {
  if (self) {
    // If the bot joined a channel, add it to the array of channels
    client.channels.push(channel);
    console.log(`Joined channel: ${channel}`);
  }
});

// Event listeners for connection and errors
client.on('connected', (address, port) => {
  console.log(`Connected to Twitch: ${address}:${port}`);
});

client.on('disconnected', (reason) => {
  console.log(`Disconnected: ${reason}`);
});

client.on('error', (err) => {
  console.error('Error:', err);
});
