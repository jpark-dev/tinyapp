const { assert } = require('chai');
const { getUserByEmail, isPasswordCorrect } = require('../helpers');
const bcrypt = require("bcrypt");

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "$2b$10$MOrLs.h6S.zDvqOHxIuKQeFzH2.rcAus377LnZOaFygWGPWrrOUgy"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with invalid email address', () => {
    const user = getUserByEmail("user4@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
    
  });
});

// isPasswordCorrect is fired only if user's email exists in the userDB
describe('isPasswordCorrect', () => {
  it('should return an ID if bcrypted password matches', () => {
    const isPWCorrect = isPasswordCorrect("bbb", "user3RandomID", bcrypt, testUsers)
    const expectedOutput = "user3RandomID";
    assert.equal(isPWCorrect, expectedOutput);
  });
  it('should return false if bcrypted password does not match', () => {
    const isPWCorrect = isPasswordCorrect("bbc", "user3RandomID", bcrypt, testUsers)
    const expectedOutput = false;
    assert.equal(isPWCorrect, expectedOutput);
  });
  it('should return false if the copied bcrypt password is entered to match the bcrypt password in userDB', () => {
    const brutePassword = "$2b$10$MOrLs.h6S.zDvqOHxIuKQeFzH2.rcAus377LnZOaFygWGPWrrOUgy";
    const isPWCorrect = isPasswordCorrect(brutePassword, "user3RandomID", bcrypt, testUsers)
    const expectedOutput = false;
    assert.equal(isPWCorrect, expectedOutput);
  });
});
