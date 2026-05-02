import express from 'express';
import homePageController from './controllers/home-page.js';

const app = express();

app.use('/', (req, res, next) => {
  console.log(`Call received on my first chatbot: ${req.method} ${req.url}`);
  next();
});

app.get('/home', homePageController);

app.listen(3000, () => {
  console.log('My first chatbotm, listening on port 3000');
});