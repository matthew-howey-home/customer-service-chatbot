import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_STRING = `
You are a customer service assistant.
Your role is to gather data from the customer.
You must ask the user for their first name and their last name.

Always respond with the following JSON schema only:

{
  "speak_to_customer": string,
  "customer_data": {
    "firstName": string | null,
    "lastName": string | null
  }
}

Rules:
- speak_to_customer is what will be spoken to the customer.
- do not include any text outside the JSON

Completion rule:
- Only when BOTH customer_data.firstName AND customer_data.lastName are NOT null,
  you must say exactly:
  "Thank you. I have all the information I need."

- If either field is null, you must ask the user for the missing field
`

const getUserContext = (currentState, latestCustomerResponse, conversationHistory) => `
CUSTOMER_RESPONSE:
${latestCustomerResponse}

CONVERSATION_HISTORY:
${JSON.stringify(conversationHistory, null, 2)}
`;

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
let currentState = {
  customer_data: {
    firstName: null,
    lastName: null,
  },
};

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
    // if (llmOutput.customer_data.firstName && !currentState.customer_data.firstName) {
    //   currentState.customer_data.firstName = llmOutput.customer_data.firstName;
    // }
    // if (llmOutput.customer_data.lastName && !currentState.customer_data.lastName) {
    //   currentState.customer_data.lastName = llmOutput.customer_data.lastName;
    // }
  }
  rl.close();
}

runFlow();