import callLLM from '../lib/call-llm.js';

const homePageController = async (req, res) => {
  const LLMResponse = await callLLM('');
  res.send('You are on the home page');
};

export default homePageController;
