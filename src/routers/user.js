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
  try {
  } catch (e) {}
});
//Delete profile
router.delete('/:id');
module.exports = router;
