const mongoose = require('mongoose');

const { Schema } = mongoose;
const TleScheme = new Schema({
  date: {
    type: Date,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  firstline: {
    type: String,
    required: true,
  },
  secondline: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('test_tle', TleScheme);
