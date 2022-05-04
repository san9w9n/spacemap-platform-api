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
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const date = dateObj.getDate();
      const tleModel = await TleModel.findOne({
        date: {
          $gte: new Date(year, month, date),
          $lt: new Date(year, month, date + 1),
        },
      }).exec();
      if (tleModel) {
        const reSearchDate = tleModel.date;
        tleModels = await (id
          ? TleModel.find({ id, date: reSearchDate }).exec()
          : TleModel.find({ date: reSearchDate }).exec());
      }
    }
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
        firstLine: tleModel.firstline,
        secondLine: tleModel.secondline,
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

  async getIdNamePairs() {
    const tleModel = await TleModel.findOne({ id: 11 }).exec();
    if (!tleModel) {
      throw new Error('Something is wrong. (at getIdNamePairs)');
    }
    const { date } = tleModel;
    const tleModels = await TleModel.find({ date }).exec();
    if (!tleModels || tleModels.length === 0) {
      throw new Error('Something is wrong. (at getIdNamePairs)');
    }
    const idNamePairs = {};
    tleModels.forEach((model) => {
      const { id, name } = model;
      idNamePairs[id] = name;
    });
    return idNamePairs;
  }
}

module.exports = TleService;
