const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const generateRandomString = (num) => {
  let result = '';
  const length = num;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

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


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {

  const user = createUserObj(req);
  let templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const user = createUserObj(req);
  let templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = createUserObj(req);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send('<script type="text/javascript">alert("The URL is invalid or currently inaccessible.");window.history.back();</script>');
  } else {
    res.redirect(longURL);

  }
});

app.get("/register", (req, res) => {
  const user = createUserObj(req);

  let templateVars = { user };
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  const shortStr = generateRandomString(6);
  urlDatabase[shortStr] = req.body.longURL;
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
  if (req.body.email === '') {
    // res.statusCode = 404;
    return res.send('<script type="text/javascript">alert("The email address does not exist.");window.history.back();</script>');
  }

  for (let uid in users) {
    if (users[uid].email === req.body.email) {
      return res
        .cookie(`user_id`, `${users[uid].id}`)
        .redirect(301, '/urls');
    }
  }
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

  let isEmailExist = false;
  for (let user in users) {
    if (users[user].email === email) {
      console.log(user.email, email);
      isEmailExist = true;
    }
  }

  if (isEmailExist) {
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
