const mongoose = require('mongoose');

const { Schema } = mongoose;

const LogScheme = new Schema(
  {
    numUsers: {
      type: Number,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

module.exports = mongoose.model('log', LogScheme);
