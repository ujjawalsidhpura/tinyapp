const { assert } = require('chai');

const { generateRandomString, checkUser, urlsForUser } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('checkUser', function () {
  it('should return a user object with valid email', function () {
    const user = checkUser("user@example.com", users)

    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };

    assert.equal(JSON.stringify(user), JSON.stringify(expectedOutput));
  });

  it('should return a false with an email that is Not in db', function () {
    const user = checkUser("user3@example.com", users)

    const expectedOutput = false;

    assert.equal(JSON.stringify(user), JSON.stringify(expectedOutput));
  });

});
