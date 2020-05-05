const express = require('express');
const Squeak = require('../models/squeak');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
///Create a squeak
router.post('/home', auth, async (req, res) => {
  console.log(req.body);
  const squeak = new Squeak({
    content: req.body.content,
    owner: req.user._id,
  });

  try {
    await squeak.save();
    res.status(201).send(squeak);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});
///Read a squeak
router.get('/:handle/status/:id', async (req, res) => {
  try {
    const squeak = await Squeak.find({
      _id: req.params.id,
      owner: req.params.handle,
    });
    console.log(squeak);
    res.status(200).send(squeak);
  } catch (e) {
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

//contribute to a squeak with comments likes or etc
router.post('/:handle/status/:id/like', auth, async (req, res) => {
  try {
    const userToLike = req.user;
    const squeakToBeLiked = await Squeak.findById(req.params.id);

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
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
