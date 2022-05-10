const mongoose = require('mongoose');

const { Schema } = mongoose;

const InterestedSatellitesScheme = new Schema({
  email: {
    type: String,
    required: true,
  },
  satellitesIDs: {
    type: Array,
    items: { type: Number, uniqueItems: true },
    required: true,
  },
});

module.exports = mongoose.model(
  'interestedSatellite',
  InterestedSatellitesScheme
);
