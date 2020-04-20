const express = require('express');
const Squeak = require('../models/squeak');
const router = new express.Router();

router.post('/squeak', async (req, res) => {
  console.log(req.body);
  const squeak = new Squeak({
    content: req.body.content,
    owner: null,
  });

  try {
    await squeak.save();
    res.status(201).send(squeak);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
