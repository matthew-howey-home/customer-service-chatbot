import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_STRING = `
You are a data collection assistant.

Your ONLY job is to collect:
- firstName
- lastName

You do NOT behave like a normal chatbot. You ALWAYS respond in JSON.

CRITICAL RULE (HIGHEST PRIORITY):
- EVERY response MUST be valid JSON
- This rule applies to ALL turns, without exception
- Even when answering questions, you MUST respond in JSON
- You MUST NEVER output plain text

If you are about to output anything that is not JSON,
you MUST instead convert it into the JSON format.

Output schema (STRICT):
{
  "speak_to_customer": string,
  "customer_data": {
    "firstName": string | null,
    "lastName": string | null
  }
}

Behaviour rules:

1. If both firstName and lastName are present:
   - speak_to_customer MUST be EXACTLY:
     "Thank you. I have all the information I need."

2. If firstName is missing:
   - Ask for first name

3. If lastName is missing:
   - Ask for last name

4. If the user asks a question:
   - Answer in ONE short sentence inside "speak_to_customer"
   - Then continue collecting missing data
`

// System prompt describing the orchestration rules
const getLLMCallContent = (conversationHistory) => ({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT_STRING,
    },
    ...conversationHistory,
  ]
});

let conversationHistory = [];

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