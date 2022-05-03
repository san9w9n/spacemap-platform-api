/* eslint-disable class-methods-use-this */

const fs = require('fs');
const { promisify } = require('util');
const DateHandler = require('./date-handler');

const promiseReadFile = promisify(fs.readFile);

class TleHandler {
  static isNumeric(inputString) {
    const stringId = inputString.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
    if (stringId === '' || Number.isNaN(Number(stringId))) {
      return false;
    }
    return true;
  }

  static #isValidString(string) {
    return string && string.length > 0;
  }

  static #getTleIdFromFirstLine(firstLine) {
    const firstLineArray = firstLine.split(/[ \t]+/);
    if (!firstLineArray || firstLineArray.length < 5) {
      throw new Error('firstLine split failed.');
    }
    const stringId = firstLineArray[1].replace('U', '');
    if (!this.isNumeric(stringId)) {
      throw new Error('Undefined Id.');
    }
    return Number(stringId);
  }

  /**
   * @param {Date} dateObj
   * @param {String} tlePlainTexts
   */
  static parseTlePlainTexts(dateObj, tlePlainTexts) {
    const tleArray = tlePlainTexts.split('\r\n');
    const tleArrayLength = tleArray.length;
    const tles = [];
    for (let i = 0; i < tleArrayLength; i += 3) {
      const satelliteName = tleArray[i].slice(2, tleArray[i].length);
      const firstLine = tleArray[i + 1];
      const secondLine = tleArray[i + 2];
      if (
        this.#isValidString(satelliteName) &&
        this.#isValidString(firstLine) &&
        this.#isValidString(secondLine)
      ) {
        let id;
        try {
          id = this.#getTleIdFromFirstLine(firstLine);
        } catch (err) {
          // eslint-disable-next-line no-continue
          continue;
        }
        tles.push({
          date: dateObj,
          id,
          name: satelliteName,
          firstline: firstLine,
          secondline: secondLine,
        });
      }
    }
    return tles;
  }

  /**
   * @param {String} dateObj
   */
  static async readTleFromLocalFile(dateObj) {
    const tleFileName = DateHandler.getFileNameByDateObject(dateObj);
    const tleFilePath = `./public/tle/${tleFileName}.tle`;
    const readOptions = {
      encoding: 'utf-8',
    };
    const tlePlainTexts = await promiseReadFile(tleFilePath, readOptions);
    return tlePlainTexts;
  }
}

module.exports = TleHandler;
