// test_openai.js
import OpenAI from "openai";

// Make sure you have your API key set in the environment
// export OPENAI_API_KEY="YOUR_KEY_HERE"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello! Can you explain that you will need to take name details?" }
      ],
    });

    const responseText = completion.choices[0].message.content;
    console.log("LLM Response:\n", responseText);

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

main();