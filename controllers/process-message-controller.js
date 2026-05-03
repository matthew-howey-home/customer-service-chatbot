import callLLM from '../lib/call-llm.js';
import textToSpeech from '../lib/text-to-speech.js';

const processMessageController = async (req, res) => {
  console.log('Message received was:', req.body);
  const llmResponse = await callLLM(req.body.message);
  const fileName = await textToSpeech(llmResponse.speak_to_customer);
  res.json({ fileName });
};

export default processMessageController;