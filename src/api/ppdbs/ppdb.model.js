const mongoose = require('mongoose');

const { Schema } = mongoose;

const PpdbScheme = new Schema({
  created_at: {
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
  sid: {
    type: Number,
    required: true,
  },
  pdca: {
    type: Number,
    required: true,
  },
  sdca: {
    type: Number,
    required: true,
  },
  ptca: {
    type: Number,
    required: true,
  },
  stca: {
    type: Number,
    required: true,
  },
  probability: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ppdb', PpdbScheme);
