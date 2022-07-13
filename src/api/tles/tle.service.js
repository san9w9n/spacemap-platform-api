/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleModel = require('./tle.model');
const TleHandler = require('../../lib/tle-handler');
const DateHandler = require('../../lib/date-handler');
const { BadRequestException } = require('../../common/exceptions');

class TleService {
  async saveTlesOnDatabase(dateObj, tlePlainTexts) {
    const tles = TleHandler.parseTlePlainTexts(dateObj, tlePlainTexts);
    console.log('db save start');
    try {
      await TleModel.create(tles, { ordered: false });
    } catch (err) {
      // pass
    }
    console.log('db save finish');
    const newTlePlainTexts = await Promise.all(
      tles.map(async (tle) => {
        try {
          const { name, firstline, secondline } = tle;
          return `0 ${name}\r\n${firstline}\r\n${secondline}\r\n`;
        } catch (err) {
          return '';
        }
      }),
    );
    return newTlePlainTexts.join('');
  }

  async findTlesFromFile(dateObj, id) {
    try {
      const tleFromFile = await TleHandler.readTlePlainTextsFromFile(dateObj);
      await this.saveTlesOnDatabase(dateObj, tleFromFile);
      const tleModels = await (id
        ? TleModel.find({ id, date: dateObj }).exec()
        : TleModel.find({ date: dateObj }).exec());
      return tleModels;
    } catch (err) {
      return [];
    }
  }

  async findTlesByOnlyDateFromFile(dateObj, id) {
    try {
      const { tleFromFile, newDateObj } =
        await TleHandler.readMostRecentTlePlainTextsFromFile(dateObj);
      await this.saveTlesOnDatabase(newDateObj, tleFromFile);
      const tleModels = await (id
        ? TleModel.find({ id, date: newDateObj }).exec()
        : TleModel.find({ date: newDateObj }).exec());
      return tleModels;
    } catch (err) {
      return [];
    }
  }

  async findTlesByOnlyDate(dateObj, id) {
    const dateObjForCompare = new Date(dateObj);
    dateObjForCompare.setDate(dateObjForCompare.getDate() - 7);
    const tleModel = await TleModel.findOne({
      date: {
        $gt: dateObjForCompare,
        $lte: dateObj,
      },
    })
      .sort({ date: -1 })
      .exec();
    if (!tleModel) {
      return undefined;
    }
    const reSearchDate = tleModel.date;
    const tleModels = await (id
      ? TleModel.find({ id, date: reSearchDate }).exec()
      : TleModel.find({ date: reSearchDate }).exec());
    return tleModels;
  }

  async findTlesByIdOrDate(dateObj, id) {
    let tleModels = await (id
      ? TleModel.find({ id, date: dateObj }).exec()
      : TleModel.find({ date: dateObj }).exec());
    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesFromFile(dateObj, id);
    }
    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesByOnlyDate(dateObj, id);
    }
    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesByOnlyDateFromFile(dateObj, id);
    }
    if (!tleModels || tleModels.length === 0) {
      throw new BadRequestException('Wrong params. Please write correct date.');
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

  async deleteTles(dateObj) {
    const compareDate = new Date(dateObj);
    compareDate.setDate(compareDate.getDate() - 7);
    const queryOption = {
      date: { $lt: compareDate },
    };
    return await TleModel.deleteMany(queryOption).exec();
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

  async findMostRecentTles() {
    const tleModel = await TleModel.findOne().sort({ date: -1 }).exec();
    if (!tleModel) {
      throw new BadRequestException('Empty tle table.');
    }
    const { date } = tleModel;
    const tleModels = await TleModel.find({ date }).exec();
    const tles = tleModels.map((currTleModel) => {
      return {
        name: currTleModel.name,
        firstLine: currTleModel.firstline,
        secondLine: currTleModel.secondline,
      };
    });
    return tles;
  }
}

module.exports = TleService;
