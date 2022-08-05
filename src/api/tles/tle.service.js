/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleModel = require('./tle.model');
const TleLib = require('./tle.lib');
const { BadRequestException } = require('../../common/exceptions');

class TleService {
  async saveTlesOnDatabase(dateObj, tlePlainTexts) {
    const tles = TleLib.parseTlePlainTexts(dateObj, tlePlainTexts);
    await TleModel.create(tles, { ordered: false });

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

  async findTlesFromS3(dateObj, id) {
    try {
      const { tleFromFile, newDateObj } = await TleLib.readTlePlainTextsFromS3(
        dateObj,
      );
      await this.saveTlesOnDatabase(newDateObj, tleFromFile);
      const tleModels = await (id
        ? TleModel.find({ id, date: newDateObj }).exec()
        : TleModel.find({ date: newDateObj }).exec());
      return tleModels;
    } catch (err) {
      return [];
    }
  }

  async findTlesFromDB(dateObj, id) {
    const dateObjForCompare = new Date(dateObj);
    dateObjForCompare.setUTCDate(dateObjForCompare.getUTCDate() - 7);
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

  async findTlesFromDBorS3(dateObj, id) {
    let tleModels = await (id
      ? TleModel.find({ id, date: dateObj }).exec()
      : TleModel.find({ date: dateObj }).exec());

    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesFromDB(dateObj, id);
    }
    if (!tleModels || tleModels.length === 0) {
      tleModels = await this.findTlesFromS3(dateObj, id);
    }
    if (!tleModels || tleModels.length === 0) {
      throw new BadRequestException('Wrong params. Please write correct date.');
    }

    const tles = tleModels.reduce((accumulator, tleModel) => {
      const tle = {
        name: tleModel.name,
        firstLine: tleModel.firstline,
        secondLine: tleModel.secondline,
      };
      accumulator.push(tle);
      return accumulator;
    }, []);
    return tles;
  }

  async deleteTles(dateObj) {
    const compareDate = new Date(dateObj);
    compareDate.setUTCDate(compareDate.getUTCDate() - 7);
    const queryOption = {
      date: { $lt: compareDate },
    };
    return await TleModel.deleteMany(queryOption).exec();
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
