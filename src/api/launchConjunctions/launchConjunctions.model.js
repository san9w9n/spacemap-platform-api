const mongoose = require('mongoose');

const { Schema } = mongoose;

const LaunchConjunctionsScheme = new Schema({
  createdAt: { type: Date, default: Date.now },
  email: {
    type: String,
    required: true,
  },
  trajectoryPath: {
    type: String,
    required: true,
  },
  predictionEpochTime: {
    type: Date,
  },
  launchEpochTime: {
    type: Date,
  },
  status: {
    type: String,
    require: true,
  },
  lpdbFilePath: {
    type: String,
  },
});

module.exports = mongoose.model('launchConjunctions', LaunchConjunctionsScheme);
