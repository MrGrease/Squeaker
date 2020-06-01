const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies['auth_token'];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    await user.populate('squeaks').execPopulate();
    await user.populate('likes').execPopulate();
    await user.populate('resqueaks').execPopulate();
    await user.populate('comments').execPopulate();
    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    req.user.CA = req.user.createdAt.toJSON().substring(0, 4);
    //convert image to base64 string so it can be decoded by the html image tag
    req.user.avatar = req.user.avatar.toString('base64');

    next();
  } catch (e) {
    console.log('Authentication failed' + e);
    res.render('indexpage');
  }
};

module.exports = auth;
