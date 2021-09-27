const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//GET route to Present FORM to the user(browser).GETTING the form from server to the user. Server will respond with urls_new and using ejs, it will render an HTML form.
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get('/urls/:shortURL', (req, res) => {
  // /url/:shortURL is found in req.params object 
  const shortURL = req.params.shortURL;
  const templateVars =
    { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}`);
});