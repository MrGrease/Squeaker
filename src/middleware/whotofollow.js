const User = require('../models/user');

const who = async (req, res, next) => {
  try {
    req.whotofollow = [];

    var amount = 2;
    while (amount != 0) {
      //Get a random user
      User.count().exec(function (err, count) {
        // Get a random entry
        var random = Math.floor(Math.random() * count);

        // Again query all users but only fetch one offset by our random #
        User.findOne()
          .skip(random)
          .exec(function (err, result) {
            if (req.user._id != result._id) {
              console.log(
                'Building who to follow array for' +
                  req.user._id +
                  'and adding' +
                  result._id
              );
              req.whotofollow.push(result);
            } else {
              console.log('Skipping self for who to follow list');
            }
          });
      });

      amount--;
    }
    next();
  } catch (e) {
    console.log(e);
  }
};

module.exports = who;
