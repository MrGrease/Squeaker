const express = require('express');
const Squeak = require('../models/squeak');
const User = require('../models/user');
const router = new express.Router();

///Create a squeak
router.post('/home', async (req, res) => {
  console.log(req.body);
  const squeak = new Squeak({
    content: req.body.content,
    owner: req.body.owner,
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
      id: req.params.id,
      owner: req.params.handle,
    });
    console.log(squeak);
  } catch (e) {
    res.status(404).send();
  }
});

///Update a squeak - NOT ALLOWED TO CHANGE CONTENT
///Delete a squeak
router.delete('/:handle/status/:id', async (req, res) => {
  res.status(404);
});

router.get('/:handle/status', async (req, res) => {
  try {
    //Get owner from squeak
    // const squeak = await Squeak.findById('5e9f201ebe511235e8e71644');
    // await squeak.populate('owner').execPopulate();
    // console.log(squeak.owner);
    //Get squeaks from owner
    const user = await User.find('5e9f12a8d74900242440bcbd');
    await user.populate('squeaks').execPopulate();
    console.log(user.squeaks);

    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});

module.exports = router;
