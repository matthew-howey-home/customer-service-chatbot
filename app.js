import express from 'express';

const app = express();

app.use('/', (req, res, next) => {
  console.log(`Call received on my first chatbot: ${req.method} ${req.url}`);
  next();
});
app.listen(3000, () => {
  console.log('Listening on port 3000');
});