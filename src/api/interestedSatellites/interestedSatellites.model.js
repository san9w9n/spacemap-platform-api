const mongoose = require('mongoose');

const { Schema } = mongoose;

const InterestedSatellitesScheme = new Schema({
  email: {
    type: String,
    required: true,
  },
  satellitesID: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model(
  'interestedsatellite',
  InterestedSatellitesScheme
);
