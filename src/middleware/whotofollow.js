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
            if (req.user._id.toString() != result._id.toString()) {
              console.log(
                'Building who to follow array for ' +
                  req.user._id +
                  ' and adding ' +
                  result._id
              );
              if (
                req.whotofollow.some(
                  (who) => who._id.toString() == result._id.toString()
                )
              ) {
                console.log('already in list');
              } else {
                if (
                  req.user.following.some(
                    (follow) => follow._id.toString() == result._id.toString()
                  )
                ) {
                  console.log('already following this user');
                } else {
                  console.log(req.user.following);
                  req.whotofollow.push(result);
                }
              }
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
