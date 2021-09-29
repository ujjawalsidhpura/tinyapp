const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080;

//Use body parser for FORM POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
////////////////////////////////////////////////////////////////////

//Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};

//////////////////////////////////////////////////////////////

//Helper Function 
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

////////////////////////////////////////////////////////////////////
app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id']
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render('urls_index', templateVars);
});

//GET route to Present FORM to the user(browser).GETTING the form from server to the user. Server will respond with urls_new and using ejs, it will render an HTML form.
app.get('/urls/new', (req, res) => {
  const user_id = req.cookies['user_id']
  const templateVars = {
    user: users[user_id]
  }
  res.render('urls_new', templateVars);
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //req.body is the object where FORM is sending the POST request of longURL. So to access it, we can do 'req.body.longURL'.
  //Similarly, to inject shortURL generated ramdomly by our func, we inject into req.body object by the following command below-->
  req.body.shortURL = shortURL;

  // We have shortURL and LongURl. We can inject that into our Original Database object with key:value pair -->
  urlDatabase[shortURL] = longURL;

  //Console log to double-check
  // console.log(urlDatabase);

  //Once form is submitted, Redirect to with the current shortURL as parameter. It will call app.get('urls/:shortURL'). 

  res.redirect(`/urls/${shortURL}`);
})
////////////////////////////////////////////////////////////////

//IMP-> ':' before shortURL signifies that shortURL is added dynamically. We do not use ':' for actual output.-->

app.get('/urls/:shortURL', (req, res) => {
  // app.get takes user request urls/:${shortURL} and it is added in  req.params object
  const user_id = req.cookies['user_id']
  const shortURL = req.params.shortURL;
  const templateVars =
  {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: users[user_id]
  };

  res.render('urls_show', templateVars);
});
////////////////////////////////////////////////////////////////////
//DELETING the entry from Database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  //delete the item
  delete urlDatabase[shortURL];

  res.redirect('/urls');
})
////////////////////////////////////////////////////////////////////
//UPDATE the entry in Database

app.post('/urls/:shortURL/update', (req, res) => {

  // console.log('Params', req.params)
  // console.log('Body', req.body)
  // As we can see from console, ShortURL came from params, longURL came from body.

  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  //Update
  urlDatabase[shortURL] = longURL;

  res.redirect('/urls')
})
////////////////////////////////////////////////////////////////////
// LOGIN/LOGOUT and COOKIE Functionality

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('user_id', username);

  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

////////////////////////////////////////////////////////////////////

//Registration

app.get('/register', (req, res) => {
  const user_id = req.cookies['user_id']
  const templateVars = {
    user: users[user_id]
  }
  res.render('urls_register', templateVars)
});

app.post('/register', (req, res) => {
  //Create newUser using reg form data
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const newUser = { userId, email, password };

  //Add newUser to Users database
  users[userId] = newUser;

  //Set cookies for newUser
  res.cookie('user_id', userId)

  res.redirect('/urls')
})

//////////////////////////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {
  //You can get shortURL from req.params object and since form is submitted, urldatabase should have key:value pair of shortURL:longURL. Hence you can access longURL from urlDatabase

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}`);
});

