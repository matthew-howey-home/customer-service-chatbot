import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
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

async function main() {
  const messages = [{
    role: "system",
    content: SYSTEM_PROMPT
  },
  {
    role: "user",
    content: "Hi"
  }];

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    messages,
    response_format: responseFormat,
  });

  console.log(JSON.stringify(response, null, 2));
}

main();
