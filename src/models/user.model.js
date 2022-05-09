const mongoose = require('mongoose');

const { Schema } = mongoose;

const userScheme = new Schema({
  email: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  snsId: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model('user', userScheme);
