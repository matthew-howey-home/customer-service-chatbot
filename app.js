import express from 'express';
import nunjucks from 'nunjucks';

import homePageController from './controllers/home-page.js';

const app = express();
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(express.static('public'));

app.use('/', (req, res, next) => {
  console.log(`Call received on my first chatbot: ${req.method} ${req.url}`);
  next();
});

app.get('/home', homePageController);

app.listen(3000, () => {
  console.log('My first chatbot, listening on port 3000');
});