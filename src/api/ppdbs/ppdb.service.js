/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const PpdbModel = require('./ppdb.model');
const PpdbHandler = require('../../lib/ppdb-handler');

class PpdbService {
  async savePpdbOnDatabase(createdAt, ppdbTexts) {
    const ppdbs = PpdbHandler.getPpdbObjectsArray(createdAt, ppdbTexts);
    await PpdbModel.insertMany(ppdbs);
  }
}

module.exports = PpdbService;
