import callLLM from '../lib/call-llm.js';
import textToSpeech from '../lib/text-to-speech.js';

const processMessageController = async (req, res) => {
  console.log('Message received was:', req.body);
};

export default processMessageController;