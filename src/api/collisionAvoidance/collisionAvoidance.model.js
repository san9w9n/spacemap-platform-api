const mongoose = require('mongoose');

const { Schema } = mongoose;

const CollisionAvoidanceScheme = new Schema({
  createdAt: { type: Date, default: Date.now },
  email: {
    type: String,
    required: true,
  },
  predictionEpochTime: {
    type: Date,
    required: true,
  },
  colaEpochTime: {
    type: Date,
    required: true,
  },
  pIdOfConjunction: {
    type: Number,
    required: true,
  },
  sIdOfConjunction: {
    type: Number,
    required: true,
  },
  firstLineOfPrimary: {
    type: String,
    required: true,
  },
  secondLineOfPrimary: {
    type: String,
    required: true,
  },
  startMomentOfCola: {
    type: Number,
    required: true,
  },
  endMomentOfCola: {
    type: Number,
    required: true,
  },
  amountOfLevel: {
    type: Number,
    required: true,
  },
  numberOfPaths: {
    type: Number,
    required: true,
  },
  avoidanceLength: {
    type: Number,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  candidatedPaths: {
    type: [String],
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
  coladbFilePath: {
    type: String,
  },
});

const ColaTaskScheme = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  taskId: {
    type: String,
    required: true,
  },
  s3InputFileKey: {
    type: [String],
    required: true,
  },
  remoteInputFileListPath: {
    type: String,
    require: true,
  },
  remoteInputFilePath: {
    type: [String],
    required: true,
  },
  remoteInputFilePrefix: {
    type: String,
    require: true,
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

ColaTaskScheme.index({ createdAt: -1 });

module.exports = {
  CollisionAvoidanceModel: mongoose.model(
    'collisionAvoidance',
    CollisionAvoidanceScheme,
  ),
  ColaTaskModel: mongoose.model('colaTask', ColaTaskScheme),
};
