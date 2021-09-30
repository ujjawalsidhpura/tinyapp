//Dependencies//

const express = require('express');
const app = express();
const PORT = 8080;

//Cookie-parser
const cookieParser = require('cookie-parser')
app.use(cookieParser());


//Body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

///////////////////////////  DATABASE  //////////////////////////////////

const urlDatabase = {
  // Format of this object-->

  // b6UTxQ: {
  //   longURL: "https://www.tsn.ca",
  //   userId: "aJ48lW"
  // },
  // i3BoGr: {
  //   longURL: "https://www.google.ca",
  //   userId: "aJ48lW"
  // }
};

const users = {
  // Format of this object-->

  // {
  //   '8jej85': { userId: '8jej85', email: 'abc@gmail.com', password: '123' },
  //   '1da9g2': { userId: '1da9g2', email: 'x@gmail.com', password: '123' }
  // }
};

/////////////////////////// HELPER FUNCTIONS ///////////////////////////////////

function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

function checkUser(email, users) {
  for (let user in users) {
    const temp = users[user].email;
    if (temp === email) {
      return users[user];
    }
  }
  return false;
}

function urlsForUser(id) {
  let output = {};

  for (let shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL]

    if (id === urlObj.userId) {
      output[shortURL] = urlObj.longURL
    }
  }
  if (Object.keys(output).length === 0) {
    return false;
  }

  return output
}

/////////////////////////// HOME PAGE ///////////////////////////////////

app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  const urls = urlsForUser(user_id);

  const templateVars = {
    urls: urls,
    user: users[user_id]
  };
  res.render('urls_index', templateVars);
});

/////////////////////////// TO ADD NEW URL ///////////////////////////////////

app.get('/urls/new', (req, res) => {
  const user_id = req.cookies['user_id']
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  }
  res.render('urls_new', templateVars);
})

app.post('/new', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.cookies['user_id']

  req.body.shortURL = shortURL;

  //ShortURL is randomly generated to be assigned 
  //LongURL is coming from the /POST FORM. Check /new form to understand. Form input gives us name=longURL.         We can extract that from req.body.longURL
  //user_id is the cookie that is generated and assigned to user upon registering. Check /register POST method to understand how user_id is assigned

  // We have shortURL, LongURL and userID. 
  // We can inject that into our Original Database object with key:value pair -->
  urlDatabase[shortURL] = { longURL, userId }
  console.log(urlDatabase);

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
    longURL: urlDatabase[shortURL].longURL,
    user: users[user_id]
  };

  res.render('urls_show', templateVars);
});

//////////////////////////////// DELETING ENTRY FROM DATABASE  ////////////////////////////////////

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  //delete the item
  delete urlDatabase[shortURL];

  res.redirect('/urls');
})


//////////////////////////// UPDATE THE ENTRY IN DATABASE  ////////////////////////////////////////

app.post('/urls/:shortURL/update', (req, res) => {

  // console.log('Params', req.params)
  // console.log('Body', req.body)
  // As we can see from console, ShortURL came from params, longURL came from body.

  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;

  //Update
  urlDatabase[shortURL].longURL = longURL;

  res.redirect('/urls')
})

/////////////////////////////// LOGIN / LOGOUT and COOKIE  /////////////////////////////////////


app.get('/login', (req, res) => {
  const user_id = req.cookies['user_id'];
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
    if (user.password === password) {
      //Finding and applying cookies. Check inspect/application/cookies in browser to see what happens upon logIN
      const userId = user.userId;
      res.cookie('user_id', userId)
      //Then redirect the page to appropriate header
      res.redirect('/urls');
      return;
    } else {
      //If password is Not correct
      res.status(403).send('Password Incorrect! Please try again.');
      return;
    }
  } else {
    res.status(403).send(`No user named : '${email}' found`);
  }
})

app.post('/logout', (req, res) => {
  //Check inspect/application/cookies in browser to see what happens upon logOUT
  res.clearCookie('user_id');
  res.redirect('/urls');
})

/////////////////////////////  REGISTRATION  ///////////////////////////////////////

app.get('/register', (req, res) => {
  const user_id = req.cookies['user_id']
  const templateVars = {
    user: users[user_id]
  }
  res.render('urls_register', templateVars)
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.status(401).send('<h2> Please enter a valid email/password. </h2>');
    return;
  }
  //Check if the user already exists
  let newUser = checkUser(email, users);

  if (newUser) {
    res.status(401).send('<h2>User already registered. Please login</h2>')
  } else {
    //IF user does Not exist, then create newUser object using email,password and unique userId.
    newUser = { userId, email, password };
  }
  //Add newUser to Users database
  users[userId] = newUser;

  //Check users database
  // console.log(users)

  //Set cookies for newUser. Use user's unique 'userId' as cookie.
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

///////////////////// APP LISTENING AT PORT 8080 //////////////////
app.listen(PORT, () => {
  console.log(`App listening to ${PORT}`);
});

