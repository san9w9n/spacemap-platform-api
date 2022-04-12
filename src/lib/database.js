/* eslint-disable no-console */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_INFO;

const initializeDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'SPACEPLATFORM',
    });
    console.log('DB successfully connected.');
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  initializeDatabase,
};
