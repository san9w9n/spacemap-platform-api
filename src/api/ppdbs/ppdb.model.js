const mongoose = require('mongoose');

const { Schema } = mongoose;

const PpdbScheme = new Schema({
  createdAt: {
    type: Date,
    required: true,
  },
  pId: {
    type: Number,
    required: true,
  },
  pName: {
    type: String,
    required: true,
  },
  sId: {
    type: Number,
    required: true,
  },
  sName: {
    type: String,
    required: true,
  },
  dca: {
    type: Number,
    required: true,
  },
  tcaTime: {
    type: Date,
    required: true,
  },
  tcaStartTime: {
    type: Date,
    required: true,
  },
  tcaEndTime: {
    type: Date,
    required: true,
  },
  standardTime: {
    type: Date,
    required: true,
  },
  probability: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ppdb', PpdbScheme);
