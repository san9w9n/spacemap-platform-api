/* eslint-disable no-console */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_INFO;

class DataBase {
  static async initializeDatabase() {
    return mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'SPACEMAP-PLATFORM',
    });
  }
}

module.exports = DataBase;
