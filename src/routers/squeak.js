const express = require('express');
const Squeak = require('../models/squeak');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const who = require('../middleware/whotofollow');
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
///Create a squeak
router.post('/home', upload.single('attachment'), auth, async (req, res) => {
  console.log(req.file);
  try {
    if (!req.file) {
      console.log('creating a text squeak');
      var squeak = new Squeak({
        content: req.body.content,
        owner: req.user._id,
        type: 0,
      });
    } else {
      const buffer = await sharp(req.file.buffer)
        .png()
        .resize({ width: 400, height: 400 })
        .toBuffer();
      console.log('creating image squeak' + buffer);
      var squeak = new Squeak({
        content: req.body.content,
        owner: req.user._id,
        attachment: buffer,
        type: 1,
      });
    }

    await squeak.save();
    res.status(201).redirect('/');
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});
///Read a squeak
router.get('/user/:handle/status/:id', auth, who, async (req, res) => {
  try {
    const squeak = await Squeak.findById(req.params.id);
    const squeakowner = await User.findById(req.params.handle);
    squeakowner.avatar = squeakowner.avatar.toString('base64');
    squeakowner.header = squeakowner.header.toString('base64');
    res.render('singlesqueakpage', {
      user: squeakowner,
      squeak: squeak,
      whotofollow: req.whotofollow,
    });
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});

///Update a squeak - NOT ALLOWED TO CHANGE CONTENT
///Delete a squeak
router.delete('/:handle/status/:id', auth, async (req, res) => {
  try {
    const squeak = await Squeak.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!squeak) {
      return res.status(404).send();
    } else {
      console.log(squeak);
    }

    res.send(squeak);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});
//like a post
router.post('/user/:id/status/:statid/like', auth, async (req, res) => {
  try {
    const userToLike = req.user;
    const squeakToBeLiked = await Squeak.findById(req.params.statid);

    //is this post already liked by the user?
    var alreadyLiked = false;
    for (index = 0; index < squeakToBeLiked.likes.length; index++) {
      if (squeakToBeLiked.likes[index]._id == userToLike.id) {
        alreadyLiked = true;
      }
    }

    if (alreadyLiked) {
      console.log('Already liked');

      squeakToBeLiked.likes = squeakToBeLiked.likes.filter(function (liker) {
        return userToLike.id != liker._id;
      });
    } else {
      console.log('Not liked before');
      squeakToBeLiked.likes.push({ _id: userToLike.id });
    }
    await squeakToBeLiked.save();
    res.redirect(req.get('referer'));
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});
//resqueak a post
router.post('/user/:id/status/:statid/resqueak', auth, async (req, res) => {
  try {
    const userToResqueak = req.user;
    const squeakToBeResqueaked = await Squeak.findById(req.params.statid);

    console.log('resqueaking!');
    squeakToBeResqueaked.resqueaks.push({
      _id: userToResqueak.id,
    });

    await squeakToBeResqueaked.save();
    res.redirect(req.get('referer'));
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});
//Comment on a post
router.post('/:handle/status/:id/comment', auth, async (req, res) => {
  try {
    const userToComment = req.user;
    const squeakToBeComment = await Squeak.findById(req.params.id);

    const comment = new Squeak({
      content: req.body.content,
      owner: req.user._id,
    });

    console.log('Commenting!');
    squeakToBeComment.comments.push(comment);

    await squeakToBeComment.save();
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});
module.exports = router;
