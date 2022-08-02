/* eslint-disable class-methods-use-this */
const StringHandler = require('../../lib/string-handler');
const DateHandler = require('../../lib/date-handler');
const S3Handler = require('./tle.s3handler');

class TleLib {
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
    const tleArray = tlePlainTexts.split(/[\r\n]+/);
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

  static async readTlePlainTextsFromS3(dateObj) {
    const s3Handler = new S3Handler();
    const data = await s3Handler.getObjectListsFromS3();
    const filesFromS3 = await TleLib.makeTlesListFromS3(data.Contents);
    const dateOfFiles = filesFromS3.reduce((accumulator, fileFromS3) => {
      if (fileFromS3.match(/.tle$/)) {
        const dateOfFile = fileFromS3.split(/.tle/)[0];

        const dateObjFromFile = new Date(
          Date.UTC(
            dateOfFile.substring(0, 4),
            dateOfFile.substring(5, 7) - 1,
            dateOfFile.substring(8, 10),
            dateOfFile.substring(11, 13),
          ),
        );

        accumulator.push(dateObjFromFile);
      }
      return accumulator;
    }, []);
    const dateOfFilesForSearch = dateOfFiles
      .filter((dateOfFile) => dateOfFile <= dateObj)
      .sort((a, b) => b - a);

    if (
      dateOfFilesForSearch[0] >=
      new Date(dateObj.setUTCDate(dateObj.getUTCDate() - 7))
    ) {
      const tleFileName = DateHandler.getFileNameByDateObject(
        dateOfFilesForSearch[0],
      );
      const tleFromS3 = await s3Handler.getObjectFromS3(tleFileName);
      return {
        tleFromFile: tleFromS3.Body.toString(),
        newDateObj: dateOfFilesForSearch[0],
      };
    } else {
      return null;
    }
  }

  static async makeTlesListFromS3(content) {
    const tles = content.reduce((accumulator, tle) => {
      if (tle.Size > 0) {
        const tleName = tle.Key.replace('tles/', '');
        accumulator.push(tleName);
      }
      return accumulator;
    }, []);
    return tles;
  }
}

module.exports = TleLib;
