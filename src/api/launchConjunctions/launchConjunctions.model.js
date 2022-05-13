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
    enum: ['PENDING', 'ERROR', 'DONE'],
    required: true,
    default: 'PENDING',
  },
  errorMessage: {
    type: String,
    default: undefined,
  },
  lpdbFilePath: {
    type: String,
  },
});

module.exports = mongoose.model('launchConjunctions', LaunchConjunctionsScheme);
