const Squeak = require('./squeak');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      //validate(value) {},
    },
    bio: {
      type: String,
    },
    location: {
      type: String,
    },
    website: {
      type: String,
    },
    birthdate: {},
    profilePicture: {
      type: Buffer,
    },
    headerPicture: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

userSchema.virtual('squeaks', {
  ref: 'Squeak',
  localField: '_id',
  foreignField: 'owner',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
