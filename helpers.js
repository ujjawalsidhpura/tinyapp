
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

module.exports = { generateRandomString, checkUser, urlsForUser };