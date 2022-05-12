const mongoose = require('mongoose');

const { Schema } = mongoose;

const LaunchConjunctionsScheme = new Schema({
  email: {
    type: String,
    required: true,
  },
  trajectoryPath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    require: true,
  },
  lpdbFilePath: {
    type: String,
  },
  launchConjunctionsId: {},
});

module.exports = mongoose.model('launchConjunctions', LaunchConjunctionsScheme);
