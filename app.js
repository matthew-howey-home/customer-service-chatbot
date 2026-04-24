import OpenAI from "openai";
import dotenv from "dotenv";
import express from 'express';
import nunjucks from 'nunjucks';
import path from "path";
import { fileURLToPath } from "url";
// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");

app.use('/', (req, res, next) => {
  console.log(`Call received on my first chatbot: ${req.method} ${req.url}`);
  next();
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a chatbot that collects a user's first and last name.

Always respond in this JSON format:
{
  "speak_to_customer": string,
  "customer_data": {
    "firstName": {
      value: string | null,
      spelling_confirmed: boolean
    },
    "lastName": {
      value: string | null,
      spelling_confirmed: boolean
    }
  }
}

Rules:
- Ask for missing information step by step
- Be polite and conversational in "speak_to_customer"
- If the user provides both names, acknowledge them
- Ask the user to confirm the spelling of the names
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
            firstName: {
              type: "object",
              properties: {
                value: { type: ["string", "null"] },
                spelling_confirmed: { type: ["boolean"] },
              }
            },
            lastName: {
              type: "object",
              properties: {
                value: { type: ["string", "null"] },
                spelling_confirmed: { type: ["boolean"] }
              }
            }
          },
          required: ["firstName", "lastName"]
        }
      },
      required: ["speak_to_customer", "customer_data"]
    }
  }
};

let conversationHistory = [{
  role: "user",
  content: "Hi"
}];

// System prompt describing the orchestration rules
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

  while (
    !llmOutput.customer_data.firstName.value ||
    !llmOutput.customer_data.lastName.value ||
    !llmOutput.customer_data.firstName.spelling_confirmed ||
    !llmOutput.customer_data.lastName.spelling_confirmed
  ) {
    const userInput = await askQuestion("\n[Enter user response]: ");
    llmOutput = await sendUserInput(userInput);
    console.log("\n[Full LLM Output]\n", JSON.stringify(llmOutput, 0, 2));
  }
  rl.close();
}

app.get("/home", async (req, res) => {
  console.log("=== Customer Service Simulation ===");

  let llmOutput = await sendUserInput('');
  console.log("\n[Full LLM Output]\n", JSON.stringify(llmOutput, 0, 2));

  res.render("home.njk", {
    speakToCustomer: llmOutput.speak_to_customer,
  });
});

// runFlow();
