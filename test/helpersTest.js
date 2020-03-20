const { assert } = require('chai');
const { getUserByEmail, isPasswordCorrect, createUserObj, createUserUrl } = require('../helpers');
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

const testURLs = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user3RandomID" }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with invalid email address', () => {
    const user = getUserByEmail("user4@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
    
  });
});

// isPasswordCorrect is fired only if user's email exists in the userDB
describe('isPasswordCorrect', () => {
  it('should return an ID if bcrypted password matches', () => {
    const isPWCorrect = isPasswordCorrect("bbb", "user3RandomID", bcrypt, testUsers);
    const expectedOutput = "user3RandomID";
    assert.equal(isPWCorrect, expectedOutput);
  });
  it('should return false if bcrypted password does not match', () => {
    const isPWCorrect = isPasswordCorrect("bbc", "user3RandomID", bcrypt, testUsers);
    const expectedOutput = false;
    assert.equal(isPWCorrect, expectedOutput);
  });
  it('should return false if the copied bcrypt password is entered to match the bcrypt password in userDB', () => {
    const brutePassword = "$2b$10$MOrLs.h6S.zDvqOHxIuKQeFzH2.rcAus377LnZOaFygWGPWrrOUgy";
    const isPWCorrect = isPasswordCorrect(brutePassword, "user3RandomID", bcrypt, testUsers);
    const expectedOutput = false;
    assert.equal(isPWCorrect, expectedOutput);
  });
});

describe('createUserObj', () => {
  it('should return a valid user object with keys if the cookie contains user_id', () => {
    const user = createUserObj('user2RandomID', testUsers);
    const expectedOutput = testUsers['user2RandomID'];
    assert.deepEqual(user, expectedOutput);
  });
  it('should return an empty object if non-existing user_id was used passed on to cookies', () => {
    const user = createUserObj('user99RandomID', testUsers);
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });
});

describe('createUserUrl', () => {
  it('should return a valid user object with keys if the cookie contains user_id', () => {
    const user = createUserUrl('user2RandomID', testURLs);
    const expectedOutput = { 'b2xVn2': 'http://www.lighthouselabs.ca' };
    assert.deepEqual(user, expectedOutput);
  });
  it('should return an empty object if non-existing user_id was used passed on to cookies', () => {
    const user = createUserUrl('user99RandomID', testURLs);
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });
});
