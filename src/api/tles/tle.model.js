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

TleScheme.index({ date: 1, id: 1 }, { unique: true });

module.exports = mongoose.model('tle', TleScheme);
