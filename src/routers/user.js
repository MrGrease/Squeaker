const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('please upload an image'));
    }

    cb(undefined, true);
  },
});

//Routes
router.get('/register', async (req, res) => {
  res.render('registerpage');
});

router.post(
  '/register',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'header', maxCount: 1 },
  ]),
  async (req, res) => {
    const buffer = await sharp(req.files['avatar'][0]['buffer'])
      .resize({ width: 400, height: 400 })
      .png()
      .toBuffer();
    req.avatar = buffer;
    const bufferh = await sharp(req.files['header'][0]['buffer'])
      .resize({ width: 1500, height: 500 })
      .png()
      .toBuffer();
    req.header = bufferh;
    const user = new User(req.body);
    user.avatar = req.avatar;
    user.header = req.header;
    try {
      await user.save();
      const token = await user.generateAuthToken();
      res.cookie('auth_token', token, {
        maxAge: 36000,
        httpOnly: false,
        secure: false,
      });
      res.redirect('/');
    } catch (e) {
      res.status(400).send(e);
    }
  }
);
//Login user
router.post('/login', async (req, res) => {
  try {
    console.log(req.body.email);
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.cookie('auth_token', token, {
      maxAge: 36000,
      httpOnly: false,
      secure: false,
    });
    res.redirect('/');
  } catch (e) {
    console.log(e);
    res.redirect('login');
  }
});
//Get Login Page
router.get('/login', async (req, res) => {
  res.render('loginpage');
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
router.post('/user/:id/follow', auth, async (req, res) => {
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
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate('squeaks').populate('comments').execPopulate();
    res.render('myprofilepage', { user: req.user });
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Get Edit page
router.get('/user/:id/edit', auth, async (req, res) => {
  try {
    res.render('Editpage', { user: req.user });
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Get Home
router.get('/', auth, async (req, res) => {
  res.render('homepage', {
    user: req.user,
  });
});
//Get likes
router.get('/user/:id/likes', async (req, res) => {
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
router.get('/user/:id/resqueaks', async (req, res) => {
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
router.get('/user/:id/comments', async (req, res) => {
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
//post because patch doesn't work for some reason
router.post(
  '/user/:id/edit',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'header', maxCount: 1 },
  ]),
  auth,
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (req.files['avatar']) {
      const buffer = await sharp(req.files['avatar'][0]['buffer'])
        .resize({ width: 400, height: 400 })
        .png()
        .toBuffer();
      req.avatar = buffer;
      user.avatar = req.avatar;
    }
    if (req.files['header']) {
      const bufferh = await sharp(req.files['header'][0]['buffer'])
        .resize({ width: 1500, height: 500 })
        .png()
        .toBuffer();
      req.header = bufferh;
      user.header = req.header;
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'name',
      'handle',
      'email',
      'bio',
      'location',
      'website',
      'birthdate',
      'avatar',
      'header',
      'password',
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid Updates!' });
    }
    try {
      updates.forEach(function selectiveUpdate(update) {
        if (req.body[update] != '') {
          user[update] = req.body[update];
        }
      });
      await user.save();
      res.redirect('/' + user._id);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  }
);
//Delete profile
router.delete('/deleteprofile', auth, async (req, res) => {
  console.log('deleteign!');
  try {
    await req.user.remove();

    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

module.exports = router;
