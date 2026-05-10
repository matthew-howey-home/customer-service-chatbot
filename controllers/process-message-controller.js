import callLLM from '../lib/call-llm.js';
import textToSpeech from '../lib/text-to-speech.js';

const processMessageController = async (req, res) => {
  console.log('Message received was:', req.body);
  const llmResponse = await callLLM(req.body.message);
  const { customer_data } = llmResponse;
  const { firstName, lastName } = customer_data;
  if (
   firstName.correct_spelling && firstName.spelling_confirmed
   && lastName.correct_spelling && lastName. spelling_confirmed
  ) {
    const fileName = await textToSpeech('Thank you for confirming the spelling of your first and last names.');
    res.json({ audio_url: fileName, stop_conversation: true, customer_data });
  } else {
    const fileName = await textToSpeech(llmResponse.speak_to_customer);
    res.json({ audio_url: fileName });
  }
};

export default processMessageController;