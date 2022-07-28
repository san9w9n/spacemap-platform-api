const mongoose = require('mongoose');

const { Schema } = mongoose;

const ColadbScheme = new Schema({
  createdAt: {
    type: Date,
    required: true,
  },
  placeId: {},
  pid: {
    type: Number,
    required: true,
  },
  pName: {
    type: String,
    required: true,
  },
  sid: {
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
});

module.exports = mongoose.model('coladb', ColadbScheme);
