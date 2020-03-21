// get user info with email, if no email exists, return undefined
const getUserByEmail = (email, userDB) => {
  for (let uid in userDB) {
    if (userDB[uid].email === email) {
      return uid;
    }
  }
  return undefined;
};

// password validation via bcrypt
const isPasswordCorrect = (password, uid, bcrypt, userDB) => {
  if (bcrypt.compareSync(password, userDB[uid].password)) {
    return uid;
  }
  return false;
};

// return true if requested url belongs to userID
const urlsForUser = (shortURL, userID, urlDB) => {
  if (userID !== urlDB[shortURL].userID) {
    return false;
  }
  return true;
};

// create user object from DB with userID
const createUserObj = (userID, userDB) => {
  const user = {};
  for (let uid in userDB) {
    if (userDB[uid].id === userID) {
      Object.assign(user, userDB[userID]);
    }
  }
  return user;
};

// create object userURl with urls belong to userID
const createUserUrl = (userID, urlDB) => {
  const userUrl = {};
  for (let el in urlDB) {
    if (urlDB[el].userID === userID) {
      userUrl[el] = urlDB[el].longURL;
    }
  }
  return userUrl;
};

// create a random alphanumeric with length: num
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