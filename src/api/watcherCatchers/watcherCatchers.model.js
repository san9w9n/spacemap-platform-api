const mongoose = require('mongoose');

const { Schema } = mongoose;

const WatcherCatchersScheme = new Schema({
  createdAt: { type: Date, default: Date.now },
  email: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  localX: {
    type: Number,
    required: true,
  },
  localY: {
    type: Number,
    required: true,
  },
  localZ: {
    type: Number,
    required: true,
  },
  altitude: {
    type: Number,
    required: true,
  },
  fieldOfView: {
    type: Number,
    required: true,
  },
  epochTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  predictionEpochTime: {
    type: Date,
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
  wcdbFilePath: {
    type: String,
  },
});

const WatcherCatchersTaskScheme = new Schema({
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
WatcherCatchersTaskScheme.index({ createdAt: -1 });

module.exports = {
  WatcherCatchersModel: mongoose.model(
    'watcherCatchers',
    WatcherCatchersScheme,
  ),
  WatcherCatchersTaskModel: mongoose.model(
    'watcherCatchersTask',
    WatcherCatchersTaskScheme,
  ),
};
