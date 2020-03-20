# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

TinyApp starts with user registration.

!["TinyApp starts with user registration"](https://github.com/zeipar/tinyapp/blob/master/docs/00_RegisterID.png)

You can add as many short URLs for your convenience.
!["You can add as many short URLs for your convenience"](https://github.com/zeipar/tinyapp/blob/master/docs/01_ShowList.png)

Once created, you can always change the address, too!
!["Once created, you can always change the address, too!"](https://github.com/zeipar/tinyapp/blob/master/docs/02_Create&EditURL.png)

You can edit, delete... manage your URLs!!
!["You can edit, delete... manage your URLs!!"](https://github.com/zeipar/tinyapp/blob/master/docs/03_Manage&DeleteURL.png)

After done with your URLs, safely logout.
!["After done with your URLs, safely logout."](https://github.com/zeipar/tinyapp/blob/master/docs/04_Delete&Logout.png)

You can let your friends use your urls, but only you have access to manage your URLs!!
!["Others can use your urls, but only you have access to your own URLs!!"](https://github.com/zeipar/tinyapp/blob/master/docs/05_LoggedOut.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Known Issues

- Express' res.redirect with assigned statuscode seems to have a bug when it's used twice, even if it's totally seperated within a IF Statement.


The code below did not work, console logs did not fire, and only executed one of the res.redirect() no matter what.
```javascript
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(301, "/urls");
  }
  res.redirect(301, "/login");
});

```

Failed attempts follows:

```javascript
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(301, "/urls");
  } else {
    return res.redirect(301, "/login");
});

```

```javascript
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect(301, "/urls");
  } else {
    return res.redirect(301, "/login");
});

```


The working way was to assign different statuscode for each redirect, regardless of whether they are totally different case within IF statement.

```javascript
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect(301, "/urls");
  } else {
    return res.redirect(302, "/login");
});

```

Thus, at this point, statuscode for these redirects are not assigned, and to be studied and implemented in a later stage.

```javascript
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

```