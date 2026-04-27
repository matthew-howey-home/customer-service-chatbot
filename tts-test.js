import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const text = "Hello! This is a text to speech test using OpenAI.";

const response = await client.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "alloy",
  input: text,
});

const buffer = Buffer.from(await response.arrayBuffer());
fs.writeFileSync("speech.mp3", buffer);

console.log("Audio saved as speech.mp3");