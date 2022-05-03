const mongoose = require('mongoose');

const { Schema } = mongoose;

const PpdbScheme = new Schema({
  createdAt: {
    type: String,
    required: true,
  },
  standardDate: {
    type: String,
    required: true,
  },
  tcaDate: {
    type: Number,
    required: true,
  },
  tcaStartDate: {
    type: Number,
    required: true,
  },
  tcaEndDate: {
    type: Number,
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

  probability: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ppdb', PpdbScheme);
