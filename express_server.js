///////////////////// DEPENDENCIES ///////////////////////////

const express = require('express');
const app = express();
const PORT = 8080;

//Cookie-Session (encrypted)
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['Test This is my key one', 'This is just some jiberjibar']
}));

//Body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//Password Encription
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

app.set('view engine', 'ejs');

///////////////////////////  DATABASE  //////////////////////////////////

const urlDatabase = {
  // Format of this object-->

  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW"
  }
};

const users = {
  // Format of this object-->

  // {
  //   '8jej85': { userId: '8jej85', email: 'abc@gmail.com', password: '123' },
  //   '1da9g2': { userId: '1da9g2', email: 'x@gmail.com', password: '123' }
  // }
};

/////////////////////////// HELPER FUNCTIONS ///////////////////////////

const { generateRandomString, checkUser, urlsForUser, shortURLCheck, HTMLMessageMaker } = require('./helpers');

/////////////////////////// HOME PAGE ///////////////////////////////////

app.get('/', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }

  const urls = urlsForUser(user_id, urlDatabase);

  const templateVars = {
    urls: urls,
    user: users[user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }
  const urls = urlsForUser(user_id, urlDatabase);

  const templateVars = {
    urls: urls,
    user: users[user_id]
  };
  res.render('urls_index', templateVars);
});

/////////////////////////// TO ADD NEW URL /////////////////////////////

app.get('/urls/new', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session.user_id;

  req.body.shortURL = shortURL;

  //ShortURL is randomly generated to be assigned 
  //LongURL is coming from the /POST FORM. Check /new form to understand. Form input gives us name=longURL.         We can extract that from req.body.longURL
  //user_id is the cookie that is generated and assigned to user upon registering. Check /register POST method to understand how user_id is assigned

  // We have shortURL, LongURL and userID. 
  // We can inject that into our Original Database object with key:value pair -->
  urlDatabase[shortURL] = { longURL, userId };
  console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});


//////////////////////   OTHER ROUTES  ///////////////////////////////
//IMP-> ':' before shortURL signifies that shortURL is added dynamically. We do not use ':' for actual output.-->

app.get('/urls/:shortURL', (req, res) => {
  // app.get takes user request urls/:${shortURL} and it is added in  req.params object
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const shortUrlObject = shortURLCheck(shortURL, urlDatabase);

  if (!user_id) {
    res.status(403).send(HTMLMessageMaker('No user logged in! User must log in.'));
    return;
  }

  if (!shortUrlObject) {
    res.status(403).send(HTMLMessageMaker('No such ShortURL found!!'));
    return;
  };

  if (shortUrlObject.userId !== user_id) {
    res.status(403).send(HTMLMessageMaker('No such URL in this User Database'));
    return;
  };

  const templateVars =
  {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[user_id]
  };

  res.render('urls_show', templateVars);

});

///////////////// UPDATE THE ENTRY IN DATABASE  /////////////////

app.post('/urls/:shortURL/', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  //Update
  urlDatabase[shortURL].longURL = longURL;

  res.redirect('/urls');

});

////////////////// DELETING ENTRY FROM DATABASE  /////////////

app.get('/urls/:shortURL/delete', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }

  const shortURL = req.params.shortURL;
  if (urlsForUser(user_id, urlDatabase)) {
    //IF shortURL is found in the userDB then Delete the item
    delete urlDatabase[shortURL];

    res.redirect('/urls');
  } else {
    res.status(401).send(HTMLMessageMaker('No such URL in this user Database.'));
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }

  const shortURL = req.params.shortURL;
  if (urlsForUser(user_id, urlDatabase)) {
    //IF shortURL is found in the userDB then Delete the item
    delete urlDatabase[shortURL];

    res.redirect('/urls');
  } else {
    res.status(401).send(HTMLMessageMaker('No such URL in this user Database.'));
  }
});

////////////// LOGIN-LOGOUT and COOKIE  //////////////////////////

app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user: users[user_id]
  }
  res.render('urls_login', templateVars);
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = checkUser(email, users);

  //checkUser function will return a user object in format user : {id,email,password}

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      //Finding and applying cookies. Check inspect/application/cookies in browser to see what happens upon logIN
      const userId = user.userId;
      req.session.user_id = userId
      //Then redirect the page to appropriate header
      res.redirect('/urls');
      return;
    } else {
      //If password is Not correct
      res.status(403).send(HTMLMessageMaker('Password Incorret! Please try again.'));
      return;
    }
  } else {
    res.status(403).send(HTMLMessageMaker(`No user registered with ${email}`));
  }
});

app.post('/logout', (req, res) => {
  //Check inspect/application/cookies in browser to see what happens upon logOUT
  req.session = null;

  res.redirect('/urls');
});

//////////////////////  REGISTRATION  ///////////////////////////

app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user: users[user_id]
  }
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  // const password = req.body.password; --> non hashed password
  const password = bcrypt.hashSync(req.body.password, salt);

  //Check if either Inputs are empty
  if (email === '' || password === '') {
    res.status(401).send(HTMLMessageMaker('Please enter a valid Email Or Password'));
    return;
  }
  //Check if the user already exists
  let newUser = checkUser(email, users);

  if (newUser) {
    res.status(401).send(HTMLMessageMaker('This email is already registered.Please login.'));
    return;
  } else {
    //IF user does Not exist, then create newUser object using email,password and unique userId.
    newUser = { userId, email, password };
  }
  //Add newUser to Users database
  users[userId] = newUser;

  //Set cookies for newUser. Use user's unique 'userId' as cookie. Cookie name is user_id.
  req.session.user_id = userId

  res.redirect('/urls')
})

////////////////  SHORT-URL REDIRECT ////////////////////////

app.get("/u/:shortURL", (req, res) => {
  //You can get shortURL from req.params object and since form is submitted, urldatabase should have key:value pair of shortURL:longURL. Hence you can access longURL from urlDatabase

  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }
  const shortURL = req.params.shortURL;
  if (shortURLCheck(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;

    res.redirect(longURL);
  } else {
    res.status(401).send(HTMLMessageMaker('No such URL in this user Database.'));
  }
});

///////////////////// APP LISTENING AT PORT 8080 //////////////////
app.listen(PORT, () => {
  console.log(`App listening to ${PORT}`);
});

