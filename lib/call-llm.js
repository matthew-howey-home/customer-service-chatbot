
import OpenAI from "openai";
import dotenv from "dotenv";

import SYSTEM_PROMPT from "../llm-instructions/system-prompt.js";
import responseFormat from "../llm-instructions/response-format.js";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// initialise in memory conversation history
let conversationHistory = [{
  role: "user",
  content: "Hi"
}];

const getLLMCallContent = (conversationHistory) => ({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...conversationHistory,
  ],
  response_format: responseFormat,
});

async function callLLM(userInput) {
  if (userInput) {
    conversationHistory.push({
      role: 'user',
      content: userInput,
    });
  }

  const llmCallContent = getLLMCallContent(conversationHistory);
  console.log('[Sending the following to LLM:]', JSON.stringify(llmCallContent, 0, 2));

  const completion = await client.chat.completions.create(llmCallContent);

  const llmOutput = completion.choices[0].message.content;

  const parsedOutput = JSON.parse(llmOutput);
  conversationHistory.push({ role: "assistant", content: parsedOutput.speak_to_customer });

  console.log('Response from LLM:');
  console.log(JSON.stringify(parsedOutput));

  return parsedOutput;
}

export default callLLM;