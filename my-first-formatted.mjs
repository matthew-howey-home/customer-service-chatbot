import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a chatbot that collects a user's first and last name.

Always respond in this JSON format:
{
  "speak_to_customer": string,
  "customer_data": {
    "firstName": string | null,
    "lastName": string | null
  }
}

Rules:
- Ask for missing information step by step
- Be polite and conversational in "speak_to_customer"
- If the user provides both names, acknowledge them
- Do not include anything outside the JSON
`;

const responseFormat = {
  type: "json_schema",
  json_schema: {
    name: "customer_interaction",
    schema: {
      type: "object",
      properties: {
        speak_to_customer: { type: "string" },
        customer_data: {
          type: "object",
          properties: {
            firstName: { type: ["string", "null"] },
            lastName: { type: ["string", "null"] }
          },
          required: ["firstName", "lastName"]
        }
      },
      required: ["speak_to_customer", "customer_data"]
    }
  }
}

let conversationHistory = [{
  role: "user",
  content: "Hi"
}];

// System prompt describing the orchestration rules
const getLLMCallContent = (conversationHistory) => ({
  model: "gpt-5.4",
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...conversationHistory,
  ],
  response_format: responseFormat,
});

async function sendUserInput(userInput) {
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

  return parsedOutput;
}

// Example CLI interaction
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function runFlow() {
  console.log("=== Customer Service CLI Simulation ===");

  let llmOutput = await sendUserInput('');
  console.log("\n[Full LLM Output]\n", JSON.stringify(llmOutput, 0, 2));

  while (!llmOutput.customer_data.firstName || !llmOutput.customer_data.lastName) {
    const userInput = await askQuestion("\n[Enter user response]: ");
    llmOutput = await sendUserInput(userInput);
    console.log("\n[Full LLM Output]\n", JSON.stringify(llmOutput, 0, 2));
  }
  rl.close();
}

runFlow();
