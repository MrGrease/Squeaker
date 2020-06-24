const User = require('../models/user');

const trends = async (req, res, next) => {
  try {
    next();
  } catch (e) {
    console.log(e);
  }
};

module.exports = trends;
