/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleModel = require('./tle.model');
const TleHandler = require('../../lib/tle-handler');

class TleService {
  /**
   * @param {Date} dateObj
   */
  async saveTlesOnDatabase(dateObj, tlePlainTexts) {
    const tles = TleHandler.parseTlePlainTexts(dateObj, tlePlainTexts);
    return TleModel.insertMany(tles);
  }

  /**
   * @param {Date} dateObj
   */
  async findTlesByIdOrDate(dateObj, id) {
    let tleModels = await (id
      ? TleModel.find({ id, date: dateObj }).exec()
      : TleModel.find({ date: dateObj }).exec());
    if (!tleModels || tleModels.length === 0) {
      const tleFromFile = await TleHandler.readTleFromLocalFile(dateObj);
      await this.saveTlesOnDatabase(dateObj, tleFromFile);
      tleModels = await (id
        ? TleModel.find({ id, date: dateObj }).exec()
        : TleModel.find({ date: dateObj }).exec());
    }
    const tles = tleModels.map((tleModel) => {
      return {
        name: tleModel.name,
        firstLine: tleModel.firstLine,
        secondLine: tleModel.secondLine,
      };
    });
    return tles;
  }

  async deleteTles(dateObj = undefined) {
    if (dateObj) {
      return TleModel.deleteMany({ date: dateObj }).exec();
    }
    return TleModel.deleteMany({}).exec();
  }

  async findNameById(id) {
    const tleModel = await TleModel.findOne({ id }).exec();
    if (!tleModel) {
      return 'UNKNOWN';
    }
    const { name } = tleModel;
    return name || 'UNKNOWN';
  }
}

module.exports = TleService;
