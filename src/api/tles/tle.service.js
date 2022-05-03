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
    let tles = await (id
      ? TleModel.find({ id, date: dateObj })
      : TleModel.find({ date: dateObj }));
    if (!tles || tles.length === 0) {
      const tleFromFile = await TleHandler.readTleFromLocalFile(dateObj);
      await this.saveTlesOnDatabase(dateObj, tleFromFile);
      tles = await (id
        ? TleModel.find({ id, date: dateObj })
        : TleModel.find({ date: dateObj }));
    }
    return tles;
  }

  async deleteTles(dateObj = undefined) {
    if (dateObj) {
      return TleModel.deleteMany({ date: dateObj });
    }
    return TleModel.deleteMany({});
  }
}

module.exports = TleService;
