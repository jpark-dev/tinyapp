const getUserByEmail = (email, userDB) => {
  for (let uid in userDB) {
    if (userDB[uid].email === email) {
      return uid;
    }
  }
  return undefined;
};

const isPasswordCorrect = (password, uid, bcrypt, userDB) => {
  if (bcrypt.compareSync(password, userDB[uid].password)) {
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

const createUserObj = (userID, userDB) => {
  const user = {};
  for (let uid in userDB) {
    if (userDB[uid].id === userID) {
      Object.assign(user, userDB[userID]);
    }
  }
  return user;
};

const createUserUrl = (userID, urlDB) => {
  const userUrl = {};
  for (let el in urlDB) {
    if (urlDB[el].userID === userID) {
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