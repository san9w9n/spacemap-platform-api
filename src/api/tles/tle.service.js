/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleModel = require('./tle.model');
const TleHandler = require('../../lib/tle-handler');
const DateHandler = require('../../lib/date-handler');

class TleService {
  async saveTlesOnDatabase(dateObj, tlePlainTexts) {
    const tles = TleHandler.parseTlePlainTexts(dateObj, tlePlainTexts);
    return TleModel.insertMany(tles);
  }

  async findTlesByOnlyDate(dateObj, id) {
    const { year, month, date } =
      DateHandler.getElementsFromDateObject(dateObj);
    const tleModel = await TleModel.findOne({
      date: {
        $gte: new Date(year, month, date),
        $lt: new Date(year, month, date + 1),
      },
    }).exec();
    if (!tleModel) {
      return undefined;
    }
    const reSearchDate = tleModel.date;
    const tleModels = await (id
      ? TleModel.find({ id, date: reSearchDate }).exec()
      : TleModel.find({ date: reSearchDate }).exec());
    return tleModels;
  }

  async findTlesFromFile(dateObj, id) {
    const tleFromFile = await TleHandler.readTlePlainTextsFromFile(dateObj);
    await this.saveTlesOnDatabase(dateObj, tleFromFile);
    const tleModels = await (id
      ? TleModel.find({ id, date: dateObj }).exec()
      : TleModel.find({ date: dateObj }).exec());
    return tleModels;
  }

  async findTlesByIdOrDate(dateObj, id) {
    let tleModels = await (id
      ? TleModel.find({ id, date: dateObj }).exec()
      : TleModel.find({ date: dateObj }).exec());
    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesByOnlyDate(dateObj, id);
    }
    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesFromFile(dateObj, id);
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
