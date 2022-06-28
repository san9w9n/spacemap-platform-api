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
  trajectoryLength: {
    type: Number,
  },
  threshold: {
    type: Number,
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

const LaunchTaskScheme = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  taskId: {
    type: String,
    required: true,
  },
  remoteInputFilePath: {
    type: String,
    required: true,
  },
  remoteOutputFilePath: {
    type: String,
    required: true,
  },
  localOutputPath: {
    type: String,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
});
LaunchTaskScheme.index({ createdAt: -1 });

module.exports = {
  LaunchConjunctionsModel: mongoose.model(
    'launchConjunctions',
    LaunchConjunctionsScheme
  ),
  LaunchTaskModel: mongoose.model('launchTasks', LaunchTaskScheme),
};
