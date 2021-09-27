const express = require('express');
const app = express();
const PORT = 8080;

//Use body parser for FORM POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

//Temp Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//function 
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//GET route to Present FORM to the user(browser).GETTING the form from server to the user. Server will respond with urls_new and using ejs, it will render an HTML form.
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //req.body is the object where FORM is sending the POST request of longURL. so to access it, we can do req.body.longURL
  //Similarly, to inject shortURL generated ramdomly by our func, we inject into req.body object but the following command
  req.body.shortURL = shortURL;

  // We have shortURL and LongURl. We can inject that into our Original Database object
  urlDatabase[shortURL] = longURL;

  //Console log to double check
  console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`);
})

app.get("/u/:shortURL", (req, res) => {
  //You can get shortURL from req.params object and since form is submitted, urldatabase should have key:value pair of shortURL:longURL. Hence you can access longURL from urlDatabase

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

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


