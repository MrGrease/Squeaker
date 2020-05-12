const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');

//Create user
router.post('/register', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();

    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
//Login user
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});
//Get Login Page
router.get('/login', async (req, res) => {
  res.render('login');
});
//Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    //destroy token
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
//Logout All
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
//follow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = req.user;
    const userToBeFollowed = await User.findById(req.params.id);
    console.log(userToBeFollowed.name + ' and ' + userToFollow.name);
    console.log(userToBeFollowed.followers + ' and ' + userToFollow.following);

    //is this person trying to follow his or her own profile?
    if (req.user.id == req.params.id) {
      return res.status(400).send({ error: 'You cant follow yourself!' });
    }
    //
    var alreadyfollowed = false;
    var alreadyfollowing = false;
    for (index = 0; index < userToBeFollowed.followers.length; index++) {
      if (userToBeFollowed.followers[index]._id == userToFollow.id) {
        alreadyfollowed = true;
      }
    }
    for (index = 0; index < userToFollow.following.length; index++) {
      if (userToFollow.following[index]._id == userToBeFollowed.id) {
        alreadyfollowing = true;
      }
    }
    //
    //check if this relationship is already established
    if (alreadyfollowed || alreadyfollowing) {
      console.log('Already exists');
      //filter out the current relationship

      userToBeFollowed.followers = userToBeFollowed.followers.filter(function (
        follower
      ) {
        return follower._id != userToFollow.id;
      });

      userToFollow.following = userToFollow.following.filter(function (
        followed
      ) {
        return followed._id != userToBeFollowed.id;
      });
    } else {
      console.log('does not exist');
      userToBeFollowed.followers.push({ _id: userToFollow.id });
      userToFollow.following.push({ _id: userToBeFollowed.id });
    }

    console.log(userToBeFollowed.followers + ' and ' + userToFollow.following);
    await userToBeFollowed.save();
    await userToFollow.save();
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});
//Get profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate('squeaks').populate('comments').execPopulate();
    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Get Home
router.get(
  '/',
  /*auth,*/ async (req, res) => {
    //res.redirect('/' + req.user._id);
    res.render('home');
  }
);
//Get likes
router.get('/:id/likes', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate('likes').execPopulate();
    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Get Resqueaks
router.get('/:id/resqueaks', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate('resqueaks').execPopulate();
    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate('comments').execPopulate();
    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Update profile
router.patch('/', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'handle',
    'email',
    'bio',
    'location',
    'website',
    'birthdate',
    'profilePicture',
    'headerPicture',
    'password',
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates!' });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
//Delete profile
router.delete('/', auth, async (req, res) => {
  try {
    //const user = await User.findById(req.params.id);
    //remove is called because the pre middleware that cascades all squeaks is assigned to user
    //user.remove();
    await req.user.remove();

    res.status(202).send();
    //must also recursively delete tweets
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});
module.exports = router;
