const getUserByEmail = (email, userDB) => {
  for (let uid in userDB) {
    if (userDB[uid].email === email) {
      return uid;
    }
  }
  return false;
};

const isPasswordCorrect = (req, uid, bcrypt, userDB) => {
  if (bcrypt.compareSync(req.body.password, userDB[uid].password)) {
    return uid;
  }
  return false;
};

const urlsForUser = (req, user, urlDB) => {
  if (user.id !== urlDB[req.params.shortURL].userID) {
    return false;
  }
  return true;
};

const createUserObj = (req, userDB) => {
  const userID = req.session.user_id;
  const user = {};
  for (let uid in userDB) {
    if (userDB[uid].id === userID) {
      Object.assign(user, userDB[userID]);
    }
  }
  return user;
};

const createUserUrl = (user, urlDB) => {
  const userUrl = {};
  for (let el in urlDB) {
    if (urlDB[el].userID === user.id) {
      userUrl[el] = urlDB[el].longURL;
    }
  }
  return userUrl;
};

const generateRandomString = (num) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = { getUserByEmail, isPasswordCorrect, urlsForUser, createUserObj, createUserUrl, generateRandomString };