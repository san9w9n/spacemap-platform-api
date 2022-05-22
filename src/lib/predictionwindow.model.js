const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const PredictionWindowSchema = new Schema({
  startMoment: { type: String, default: moment().toISOString() },
  endMoment: { type: String, default: moment().toISOString() },
});

module.exports = mongoose.model('predictionwindow', PredictionWindowSchema);
