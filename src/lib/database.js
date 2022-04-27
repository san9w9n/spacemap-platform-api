/* eslint-disable no-console */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_INFO;

const initializeDatabase = async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'SPACEMAP-PLATFORM',
  });
  console.log('DB successfully connected.');
};

module.exports = initializeDatabase;
