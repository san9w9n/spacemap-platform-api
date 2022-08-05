const mongoose = require('mongoose');

const { Schema } = mongoose;

const WatcherCatcherScheme = new Schema({
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

const WatcherCatcherTaskScheme = new Schema({
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
  s3OutputFileKey: {
    type: String,
    required: true,
  },
});
WatcherCatcherTaskScheme.index({ createdAt: -1 });

module.exports = {
  WatcherCatcherModel: mongoose.model('watcherCatchers', WatcherCatcherScheme),
  WatcherCatcherTaskModel: mongoose.model(
    'watchercatchertasks',
    WatcherCatcherTaskScheme,
  ),
};
