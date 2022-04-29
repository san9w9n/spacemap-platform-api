/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleModel = require('./tle.model');
const TleHandler = require('../../lib/tle-handler');

class TleService {
  async saveTlesOnDatabase(date, tlePlainTexts) {
    const tles = TleHandler.parseTlePlainTexts(date, tlePlainTexts);
    await TleModel.insertMany(tles);
  }

  async findTlesByNameOrDate(date, name = undefined) {
    let tles = await (name
      ? TleModel.find({ name, date })
      : TleModel.find({ date }));
    if (!tles || tles.length === 0) {
      const tleFromFile = await TleHandler.readTleFromLocalFile(date);
      await this.saveTlesOnDatabase(date, tleFromFile);
      tles = await (name
        ? TleModel.find({ name, date })
        : TleModel.find({ date }));
    }
    return tles;
  }

  async deleteTles(date = undefined) {
    if (date) await TleModel.deleteMany({ date });
    else await TleModel.deleteMany({});
  }
}

module.exports = TleService;
