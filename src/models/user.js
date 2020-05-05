const Squeak = require('./squeak');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
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
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length <= 6) {
          throw new Error('Password too short');
        }
        if (value.toLowerCase().includes('password')) {
          throw new Error('That is a bad password!');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    followers: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
    following: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
  },
  {
    timestamps: true,
    //This is here to make sure the virtuals are also sent along when a get request is made for the profile
    toJSON: { virtuals: true },
  }
);

//accessible on models
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject({ virtuals: true }); //set virtuals to true so that squeaks are included

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

//accessible on instances
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};
//set up a virtual relationship between the squeaks and their owners
userSchema.virtual('squeaks', {
  ref: 'Squeak',
  localField: '_id',
  foreignField: 'owner',
});
//set up a virtual relationship between the squeaks and the users who liked them
userSchema.virtual('likes', {
  ref: 'Squeak',
  localField: '_id',
  foreignField: 'likes',
});
//set up a virtual relationship between the squeaks and the users who resqueaked them
userSchema.virtual('resqueaks', {
  ref: 'Squeak',
  localField: '_id',
  foreignField: 'resqueaks',
});
//delete all user squeaks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  console.log('removing!');
  await Squeak.deleteMany({ owner: user._id });

  next();
});

//hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
