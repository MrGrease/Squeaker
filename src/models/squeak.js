const mongoose = require('mongoose');

const squeakSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      //required: true,
      validate(value) {
        if (value.length >= 200) {
          throw new Error('Squeak too long!');
        }
      },
    },
    attachment: {
      type: Buffer,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    resqueaks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [this],
  },
  { timestamps: true }
);

const Squeak = mongoose.model('Squeak', squeakSchema);

module.exports = Squeak;
