const express = require('express');
const User = require('../models/user');
const router = new express.Router();

//Create user
router.post('/register', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();

    res.status(201).send({ user /*, token*/ });
  } catch (e) {
    res.status(400).send(e);
  }
});
//Login user
router.post('/login', async (req, res) => {
  try {
  } catch (e) {}
});
//Logout user
router.post('/logout', async (req, res) => {
  try {
  } catch (e) {}
});
//Get profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate('squeaks').execPopulate();
    console.log(user);

    res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});
//Update profile
router.patch('/:id', async (req, res) => {
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
  const isValidOperation = updates.every((update) => {
    allowedUpdates.includes(update);
  });

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
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //remove is called because the pre middleware that cascades all squeaks is assigned to user
    user.remove();
    res.status(202).send();
    //must also recursively delete tweets
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});
module.exports = router;
