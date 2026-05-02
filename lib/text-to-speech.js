import path from 'path';
import fs from "fs";

import OpenAI from "openai";
import dotenv from "dotenv";



const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const textToSpeech = async (text) => {
 // 1. Generate speech from LLM response text
  const speech = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await speech.arrayBuffer());

  // 2. Save file
  const fileName = `speech-${Date.now()}.mp3`;
  const filePath = path.join('public', fileName);

  fs.writeFileSync(filePath, buffer);

  return filePath;
}

export default textToSpeech;