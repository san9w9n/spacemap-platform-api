/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const fs = require('fs');
const { promisify } = require('util');
const TleModel = require('../../models/tle.model');

const promiseReadFile = promisify(fs.readFile);

class TleService {
  async saveTlesOnDatabase(date, tleTexts) {
    /** @type [String] */
    const tleArray = tleTexts.split('\r\n');
    const tleArrayLength = tleArray.length;
    const tles = [];
    for (let i = 0; i < tleArrayLength; i += 3) {
      const name = tleArray[i].slice(2, tleArray[i].length);
      const firstline = tleArray[i + 1];
      const secondline = tleArray[i + 2];
      if (name && firstline && secondline) {
        tles.push({
          date,
          name,
          firstline,
          secondline,
        });
      }
    }
    await TleModel.insertMany(tles);
  }

  async getTlesByNameOrDateService(date, name = undefined) {
    const tles = await (name
      ? TleModel.find({ name, date })
      : TleModel.find({ date }));
    if (tles && tles.length > 0) {
      return tles;
    }
    const tleFromFile = await promiseReadFile(`./public/tle/${date}.tle`, {
      encoding: 'utf-8',
    });
    await this.saveTlesOnDatabase(date, tleFromFile);
    const tlesGetAgain = await (name
      ? TleModel.find({ name, date })
      : TleModel.find({ date }));
    return tlesGetAgain;
  }

  async deleteTles(date = undefined) {
    if (date) await TleModel.deleteMany({ date });
    else await TleModel.deleteMany({});
  }
}

module.exports = TleService;
