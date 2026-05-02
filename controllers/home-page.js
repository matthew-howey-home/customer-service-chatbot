import callLLM from '../lib/call-llm.js';
import textToSpeech from '../lib/text-to-speech.js';

const homePageController = async (req, res) => {
  const LLMResponse = await callLLM('');
  const speechFilePath = await textToSpeech(LLMResponse.speak_to_customer);
  res.render('home.njk');
};

export default homePageController;
