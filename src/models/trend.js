const mongoose = require('mongoose');
const Squeak = require('./squeak');
const trendSchema = new mongoose.Schema({
  name: {
    type: String,
    validate(value) {
      if (value.length >= 20) {
        throw new Error('trend too long!');
      }
    },
  },
  squeaks: [
    {
      type: Squeak,
    },
  ],
});

const trend = mongoose.model('trend', trendSchema);

module.exports = trend;
