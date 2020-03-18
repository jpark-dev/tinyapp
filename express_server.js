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
  
}

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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
    res.send('<script type="text/javascript">alert("The URL is invalid or currently inaccessible.");window.history.back();</script>')
  } else {
    res.redirect(longURL);

  }
});

app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
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

  let templateVars = { shortURL: newName, longURL: urlDatabase[newName], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  res
    .cookie(`username`, `${req.body.username}`)
    .redirect(301, '/urls');
});

app.post("/logout", (req, res) => {
  res
    .clearCookie('username')
    .redirect(301, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
