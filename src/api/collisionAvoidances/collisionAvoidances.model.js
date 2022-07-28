const mongoose = require('mongoose');

const { Schema } = mongoose;

const CollisionAvoidancesScheme = new Schema({
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
  startMomentOfCola: {
    type: Date,
    required: true,
  },
  endMomentOfCola: {
    type: Date,
    required: true,
  },
  amoutOfLevel: {
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
    required: true,
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
  remoteInputFilePath: {
    type: [String],
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

ColaTaskScheme.index({ createdAt: -1 });

module.exports = {
  CollisionAvoidancesModel: mongoose.model(
    'collisionAvoidances',
    CollisionAvoidancesScheme,
  ),
  ColaTaskModel: mongoose.model('colaTasks', ColaTaskScheme),
};
