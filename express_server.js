const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!')
});

app.get('/urls', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send
    ('<html><body> <h1> Hello again from HTML</h1></body></html>')
});

//Test Codes
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });



app.listen(PORT, () => {
  console.log(`App listening to ${PORT}`);
})