/* eslint-disable class-methods-use-this */

const fs = require('fs');
const { promisify } = require('util');

const promiseReadFile = promisify(fs.readFile);

class TleHandler {
  static parseTlePlainTexts(date, tlePlainTexts) {
    const tleArray = tlePlainTexts.split('\r\n');
    const tleArrayLength = tleArray.length;
    const tles = [];
    for (let i = 0; i < tleArrayLength; i += 3) {
      const satelliteName = tleArray[i].slice(2, tleArray[i].length);
      const firstLine = tleArray[i + 1];
      const secondLine = tleArray[i + 2];
      tles.push({
        date,
        name: satelliteName,
        firstline: firstLine,
        secondline: secondLine,
      });
    }
    return tles;
  }

  static async readTleFromLocalFile(date) {
    const tleFilePath = `./public/tle/${date}.tle`;
    const readOptions = {
      encoding: 'utf-8',
    };
    const tlePlainTexts = await promiseReadFile(tleFilePath, readOptions);
    return tlePlainTexts;
  }
}

module.exports = TleHandler;
