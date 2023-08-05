const User = require("../models/userModel");
const isLogin = async (req, res, next) => {
  try {
    const userData = await User.findOne({ email: req.session.user });
    if (req.session.user && userData.isBlocked === false) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    const userData = await User.findOne({ email: req.session.user });
    if (req.session.user && userData.isBlocked === false) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
const commonNav = async (req, res, next) => {
  try {
    res.locals.session = req.session;
    next();
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  isLogin,
  isLogout,
  commonNav,
};
