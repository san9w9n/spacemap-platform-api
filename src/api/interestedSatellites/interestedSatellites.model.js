const mongoose = require('mongoose');

const { Schema } = mongoose;

const InterestedSatellitesScheme = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  interestedArray: [
    {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model(
  'interestedSatellite',
  InterestedSatellitesScheme,
);
