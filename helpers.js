
//Generate a random string that is 6 letters (alpabets/numbers) long.
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

// Returns a User OBJECT IF user found, else false.
function checkUser(email, users) {
  for (let user in users) {
    const temp = users[user].email;
    if (temp === email) {
      return users[user];
    }
  }
  return false;
}

// Returns User OBJECT from DB based on userId(which is unique)
function urlsForUser(id, database) {
  let output = {};

  for (let shortURL in database) {
    const urlObj = database[shortURL]

    if (id === urlObj.userId) {
      output[shortURL] = urlObj.longURL
    }
  }
  if (Object.keys(output).length === 0) {
    return false;
  }
  return output
}

//Function to check if shortURL exist in DB
function shortURLCheck(targetUrl, db) {

  for (let url in db) {
    if (url === targetUrl) {
      return db[url];
    }
  }
  return null;
}

//HTML message maker

function HTMLMessageMaker(message) {
  const htmlMessage =
    `<div 
    style="height: 30px; width: 50%; border: 2px black solid; border-radius: 5px; margin:auto; padding: 10px; text-align:center; margin-top:25px; font-size:21px"> 
    ${message} 
    </div>`
  return htmlMessage;
}


module.exports =
  { generateRandomString, checkUser, urlsForUser, shortURLCheck, HTMLMessageMaker };