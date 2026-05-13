import callLLM from '../lib/call-llm.js';
import textToSpeech from '../lib/text-to-speech.js';

const homePageController = async (req, res) => {
  const conversationId = crypto.randomUUID();
  const LLMResponse = await callLLM('', conversationId);
  const speechFileName = await textToSpeech(LLMResponse.speak_to_customer);
  res.render('home.njk', { initialAudio: `/${speechFileName}`, conversationId });
};

export default homePageController;
