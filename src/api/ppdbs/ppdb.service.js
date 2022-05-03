/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const PpdbModel = require('./ppdb.model');
const PpdbHandler = require('../../lib/ppdb-handler');

class PpdbService {
  async savePpdbOnDatabase(createdDateObj, ppdbTexts) {
    const ppdbs = await PpdbHandler.getPpdbObjectsArray(
      createdDateObj,
      ppdbTexts
    );
    return PpdbModel.insertMany(ppdbs);
  }
}

module.exports = PpdbService;
