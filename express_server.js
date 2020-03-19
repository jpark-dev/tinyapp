const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const generateRandomString = (num) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const isEmailExist = (req) => {
  for (let uid in users) {
    if (users[uid].email === req.body.email) { return uid; }
  }
  return false;
};

const isPasswordCorrect = (uid, req) => {
  if (users[uid].password === req.body.password) { return uid; }
  return false;
};

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

const createUserObj = (req) => {
  const userID = req.cookies["user_id"];
  const user = {};
  for (let uid in users) {
    if (users[uid].id === userID) {
      Object.assign(user, users[userID]);
    }
  }
  return user;
};

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// GET handlers
app.get("/", (req, res) => {
  res.send("Hello!");
});

const createUserUrl = (user) => {

  const userUrl = {};
  for (el in urlDatabase) {
    if (urlDatabase[el].userID === user.id) {
      userUrl[el] = urlDatabase[el].longURL;
    }
  }
  return userUrl;
};

app.get("/urls", (req, res) => {
  const user = createUserObj(req);
  const userUrl = createUserUrl(user);

  const templateVars = { urls: userUrl, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = createUserObj(req);
  let templateVars = { user };

  if (Object.keys(user).length === 0) {
    return res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = createUserObj(req);

  if (Object.keys(user).length === 0) {
    return res.send('<script type="text/javascript">alert("Please login to modify your short URL.");window.history.back();</script>');
  }
  
  console.log('user: ', user);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  // if short URL does not exist in DB
  if (!urlDatabase[req.params.shortURL]) {
    return res.send('<script type="text/javascript">alert("Invalid short URL. Please check again.");window.history.back();</script>');
  }

  // if exists
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL === undefined) {
    res.send('<script type="text/javascript">alert("The URL is invalid or currently inaccessible.");window.history.back();</script>');
  } else {
    res.redirect(301, longURL);
  }
});

app.get("/register", (req, res) => {
  const user = createUserObj(req);
  let templateVars = { user };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const user = createUserObj(req);
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

// POST handlers

app.post("/urls", (req, res) => {
  const user = createUserObj(req);
  const shortStr = generateRandomString(6);
  const newData = {};

  newData.longURL = req.body.longURL;
  newData.userID = user.id; 
  urlDatabase[shortStr] = newData; 

  res.redirect(`/urls/${shortStr}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const oldName = req.params.shortURL;
  const newName = req.body.nname;
  const url = urlDatabase[oldName];
  delete urlDatabase[oldName];
  urlDatabase[newName] = url;

  const user = createUserObj(req);

  let templateVars = { shortURL: newName, longURL: urlDatabase[newName], user };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.send('<script type="text/javascript">alert("Please enter both the email and password.");window.history.back();</script>');
  }

  const checkEmail = isEmailExist(req);

  if (checkEmail) {
    const isValid = isPasswordCorrect(checkEmail, req);
    if (isValid) {
      return res
        .cookie(`user_id`, `${users[isValid].id}`)
        .redirect(301, '/urls');
    }
  }
  return res.status(403).send('<script type="text/javascript">alert("Incorrect Email or password. Please try again.");window.history.back();</script>');

});

app.post("/logout", (req, res) => {
  res
    .clearCookie('user_id')
    .redirect(301, '/urls');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.statusCode = 400;
    return res.send('<script type="text/javascript">alert("Please enter both your email and password");window.history.back();</script>');
  }

  if (isEmailExist(req)) {
    res.statusCode = 400;
    return res.send('<script type="text/javascript">alert("The email is already being used.");window.history.back();</script>');
  }
  let id = generateRandomString(6);

  users[id] =
  {
    id, email, password
  };

  res
    .cookie(`user_id`, `${id}`)
    .redirect(301, '/urls');

  console.log('users DB:', users);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
