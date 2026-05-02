import sendUserInput from '../lib/send-user-input.js';

const homePageController = async (req, res) => {
  const LLMResponse = await sendUserInput('');
  res.send('You are on the home page');
};

export default homePageController;
