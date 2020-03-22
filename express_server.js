const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const helperFn = require('./helpers');
const methodOverride = require('method-override')


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aaaaaa", count: 0 },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aaaaaa", count: 97 }
};

const users = {
  "aaaaaa": {
    id: "aaaaaa",
    email: "aaa@a.com",
    password: "aaa"
  }
};

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set("view engine", "ejs");

// GET handlers
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

// show collection of urls for that user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const userUrl = helperFn.createUserUrl(userID, urlDatabase);
  const templateVars = { urls: userUrl, user };

  res.render("urls_index", templateVars);
});

// move to URL creating page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const templateVars = { user };

  if (!userID) {
    return res.redirect("/login");
  }
  return res.render("urls_new", templateVars);
});

// move to url edit page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const shortURL = req.params.shortURL;
  const isURL = urlDatabase[shortURL];
  const useCount = urlDatabase[shortURL].count; 
  const timeCreated = urlDatabase[shortURL].timeCreated;
  // const {useCount, timeCreated} = urlDatabase[shortURL];
  const templateVars = { shortURL, user, useCount, timeCreated };
  let msg = '';

  // if not logged in
  if (!userID) {
    msg = 'Please login to modify your short URL.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  // if url does not exist
  if (!isURL) {
    msg = 'Not a valid URL.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);

  } else {
    templateVars['longURL'] = urlDatabase[shortURL].longURL;
  }

  // if trying to modify someone else's url
  if (!helperFn.urlsForUser(shortURL, userID, urlDatabase)) {
    msg = 'You can only modify your own URLs.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  res.render("urls_show", templateVars);
});

// direct to the original URL
app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const templateVars = { user };
  let accessCounter = urlDatabase[req.params.shortURL].count;
  let msg = '';

  // if short URL does not exist in DB
  if (!urlDatabase[req.params.shortURL]) {
    msg = 'Invalid short URL. Please check again.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  // if exists, retrieve corresponding url and redirect to it
  let longURL = urlDatabase[req.params.shortURL].longURL;

  if (!longURL) {
    msg = 'The URL is invalid or currently inaccessible.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  } else {
    urlDatabase[req.params.shortURL].count = Number(accessCounter) + 1;
    return res.redirect(longURL);
  }
});

// register page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);

  let templateVars = { user };
  if (!userID) {
    return res.render("urls_register", templateVars);
  }
  res.redirect(301, '/urls');
});

// login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    return res.redirect(301, '/urls');
  }
  const user = helperFn.createUserObj(userID, users);
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

// POST handlers

// create new short URL
// app.post("/urls", (req, res) => {
app.put("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const templateVars = { user };
  const shortStr = helperFn.generateRandomString(6);
  const newData = {};
  let longURL = req.body.longURL;

  if (!userID) {
    msg = 'Please login to create your short URL.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  // set created Date / Time
  let curTime = new Date();
  let timeCreated = curTime.toUTCString();

  // if the url doesn't start with 'http://'
  if (longURL.substr(0, 7) !== 'http://' && longURL.substr(0, 8) !== 'https://') {
    longURL = `http://${longURL}`;
  }

  newData.longURL = longURL;
  newData.userID = userID;
  newData.timeCreated = timeCreated;
  newData.count = 0;

  urlDatabase[shortStr] = newData;

  res.redirect(`/urls/${shortStr}`);
});

// delete URL
// app.post("/urls/:shortURL/delete", (req, res) => {
app.delete("/urls/:shortURL/", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const templateVars = { user };
  const shortURL = req.params.shortURL;

  // if not logged in
  if (!userID) {
    msg = 'Please login to delete your short URL.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  // if trying to modify someone else's url
  if (!helperFn.urlsForUser(shortURL, userID, urlDatabase)) {
    msg = 'You can only delete your own short URLs...';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  delete urlDatabase[shortURL];
  res.redirect(301, "/urls");
});

// edit original URL, not short URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let newLongURL = req.body.nname;

  // if the edited url doesn't start with 'http://'
  if (newLongURL.substr(0, 7) !== 'http://' && newLongURL.substr(0, 8) !== 'https://') {
    newLongURL = `http://${newLongURL}`;
  }

  urlDatabase[shortURL].longURL = newLongURL;

  res.redirect(301, "/urls");
});

// login
app.post("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const templateVars = { user };
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    msg = 'Please enter both the email and password.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  const checkEmail = helperFn.getUserByEmail(email, users);

  if (checkEmail) {
    const isValid = helperFn.isPasswordCorrect(password, checkEmail, bcrypt, users);
    if (isValid) {
      req.session.user_id = users[isValid].id;
      return res.redirect(301, '/urls');
    }
  }
  msg = 'Incorrect Email or password. Please try again.';
  templateVars['msg'] = msg;
  return res.render('urls_error', templateVars);


});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(301, '/urls');
});

// register new account
app.put("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const templateVars = { user };
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === '' || password === '') {
    res.statusCode = 400;
    msg = 'Please enter both the email and password.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }

  if (helperFn.getUserByEmail(email, users)) {
    res.statusCode = 400;
    msg = 'The email is already being used.';
    templateVars['msg'] = msg;
    return res.render('urls_error', templateVars);
  }
  let id = helperFn.generateRandomString(6);

  users[id] =
  {
    id, email, password
  };

  req.session.user_id = id;
  res.redirect(301, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
