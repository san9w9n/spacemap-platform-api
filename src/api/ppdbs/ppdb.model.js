const mongoose = require('mongoose');

const { Schema } = mongoose;

const PpdbScheme = new Schema({
  createdAt: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  pid: {
    type: Number,
    required: true,
  },
  dca: {
    type: Number,
    required: true,
  },
  tca: {
    type: Number,
    required: true,
  },
  tcaStart: {
    type: Number,
    required: true,
  },
  tcaEnd: {
    type: Number,
    required: true,
  },
  probability: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ppdb', PpdbScheme);
