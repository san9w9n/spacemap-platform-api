const mongoose = require('mongoose');

const { Schema } = mongoose;

const LogScheme = new Schema({
  createdAt: {
    type: Date,
    required: true,
  },
  numUsers: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('log', LogScheme);
