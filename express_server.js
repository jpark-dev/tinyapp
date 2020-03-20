const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const helperFn = require('./helpers');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aaaaaa" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aaaaaa" }
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
    return res.redirect(301, "/login");
  }
  res.render("urls_new", templateVars);
});

// move to url edit page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = helperFn.createUserObj(userID, users);
  const shortURL = req.params.shortURL;
  const isURL = urlDatabase[shortURL];

  // if not logged in
  if (!userID) {
    return res.send('<script type="text/javascript">alert("Please login to modify your short URL.");window.history.back();</script>');
  }

  // if url does not exist
  if (!isURL) {
    return res.send('<script type="text/javascript">alert("Not a valid URL.");window.history.back();</script>');

  }

  // if trying to modify someone else's url
  if (!helperFn.urlsForUser(shortURL, userID, urlDatabase)) {
    return res.send('<script type="text/javascript">alert("You can only modify your own URLs.");window.history.back();</script>');
  }

  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
});

// direct to the original URL
app.get("/u/:shortURL", (req, res) => {
  // if short URL does not exist in DB
  if (!urlDatabase[req.params.shortURL]) {
    return res.send('<script type="text/javascript">alert("Invalid short URL. Please check again.");window.history.back();</script>');
  }

  // if exists
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (!longURL) {
    res.send('<script type="text/javascript">alert("The URL is invalid or currently inaccessible.");window.history.back();</script>');
  } else {
    res.redirect(301, longURL);
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
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  // const user = helperFn.createUserObj(userID, users);
  const shortStr = helperFn.generateRandomString(6);
  const newData = {};

  if (!userID) {
    return res.send('<script type="text/javascript">alert("Please login to create your short URL.");window.history.back();</script>');
  }
  newData.longURL = req.body.longURL;
  newData.userID = userID;
  urlDatabase[shortStr] = newData;

  res.redirect(`/urls/${shortStr}`);
});

// delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  // if not logged in
  if (!userID) {
    return res.send('<script type="text/javascript">alert("Please login to delete your short URL.");window.history.back();</script>');
  }

  // if trying to modify someone else's url
  if (!helperFn.urlsForUser(shortURL, userID, urlDatabase)) {
    return res.send('<script type="text/javascript">alert("You can only delete your own URLs.");window.history.back();</script>');
  }

  delete urlDatabase[shortURL];
  res.redirect(301, "/urls");
});

// edit short URL
app.post("/urls/:shortURL", (req, res) => {
  const oldName = req.params.shortURL;
  const newName = req.body.nname;
  urlDatabase[newName] = urlDatabase[oldName];

  delete urlDatabase[oldName];
  res.redirect(301, "/urls");
});

// login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.send('<script type="text/javascript">alert("Please enter both the email and password.");window.history.back();</script>');
  }

  const checkEmail = helperFn.getUserByEmail(email, users);

  if (checkEmail) {
    const isValid = helperFn.isPasswordCorrect(password, checkEmail, bcrypt, users);
    if (isValid) {
      req.session.user_id = users[isValid].id;
      return res.redirect(301, '/urls');
    }
  }
  res.status(403).send('<script type="text/javascript">alert("Incorrect Email or password. Please try again.");window.history.back();</script>');

});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(301, '/urls');
});

// register new account
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === '' || password === '') {
    res.statusCode = 400;
    return res.send('<script type="text/javascript">alert("Please enter both your email and password");window.history.back();</script>');
  }

  if (helperFn.getUserByEmail(email, users)) {
    res.statusCode = 400;
    return res.send('<script type="text/javascript">alert("The email is already being used.");window.history.back();</script>');
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
