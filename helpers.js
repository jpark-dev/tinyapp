const getUserByEmail = (email, userDB) => {
  for (let uid in userDB) {
    if (userDB[uid].email === email) {
      return uid;
    }
  }
  return false;
};

module.exports = { getUserByEmail };