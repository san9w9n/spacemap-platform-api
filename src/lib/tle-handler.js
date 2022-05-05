/* eslint-disable class-methods-use-this */
const { promiseReadFile, promiseWriteFile } = require('./promise-io');
const StringHandler = require('./string-handler');
const DateHandler = require('./date-handler');

class TleHandler {
  static #getTleIdFromFirstLine(firstLine) {
    const firstLineArray = firstLine.split(/[ \t]+/);
    if (!firstLineArray || firstLineArray.length < 5) {
      throw new Error('firstLine split failed.');
    }
    const stringId = firstLineArray[1].replace('U', '');
    if (!StringHandler.isNumeric(stringId)) {
      throw new Error('Undefined Id.');
    }
    return Number(stringId);
  }

  static #isVaildTle(name, firstLine, secondLine) {
    return (
      StringHandler.isValidString(name) &&
      StringHandler.isValidString(firstLine) &&
      StringHandler.isValidString(secondLine)
    );
  }

  static parseTlePlainTexts(date, tlePlainTexts) {
    const tleArray = tlePlainTexts.split('\r\n');
    const tleArrayLength = tleArray.length;
    const tles = [];
    for (let i = 0; i < tleArrayLength; i += 3) {
      const name = tleArray[i].slice(2, tleArray[i].length);
      const firstline = tleArray[i + 1];
      const secondline = tleArray[i + 2];
      if (this.#isVaildTle(name, firstline, secondline)) {
        try {
          const id = this.#getTleIdFromFirstLine(firstline);
          tles.push({
            date,
            id,
            name,
            firstline,
            secondline,
          });
        } catch (err) {
          // pass
        }
      }
    }
    return tles;
  }

  static async readTlePlainTextsFromFile(dateObj) {
    const tleFileName = DateHandler.getFileNameByDateObject(dateObj);
    const tleFilePath = `./public/tle/${tleFileName}.tle`;
    const readOptions = {
      encoding: 'utf-8',
    };
    const tlePlainTexts = await promiseReadFile(tleFilePath, readOptions);
    return tlePlainTexts;
  }

  static async saveTlesOnFile(dateObj, tles) {
    const fileName = DateHandler.getFileNameByDateObject(dateObj);
    return promiseWriteFile(`./public/tle/${fileName}.tle`, tles);
  }
}

module.exports = TleHandler;
