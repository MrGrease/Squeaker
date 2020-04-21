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

module.exports = router;
