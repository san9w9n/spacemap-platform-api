/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

const StringHandler = require('../../lib/string-handler');
const DateHandler = require('../../lib/date-handler');
const { BadRequestException } = require('../../common/exceptions');

class MetaData {
  constructor() {
    this.coordinateSystem = undefined;
    this.site = undefined;
    this.launchEpochTime = undefined;
    this.diffSeconds = undefined;
  }

  isValidMetaData() {
    return this.coordinateSystem && this.site && this.launchEpochTime;
  }

  async parseMetaData(splitedLines) {
    await Promise.all(
      splitedLines
        .filter((line) => !StringHandler.isNotComment(line))
        .map(async (line) => {
          const splitedLine = line.split(':');

          if (!splitedLine || splitedLine.length < 2) {
            return 1;
          }
          const title = splitedLine[0];
          const data = splitedLine[1].trim();

          switch (title) {
            case '%coordinate system':
              this.coordinateSystem = data;
              break;
            case '%site':
              this.site = data;
              break;
            case '%epochtime':
              // eslint-disable-next-line no-case-declarations
              const date = splitedLine.slice(1).join(':');
              if (!(await DateHandler.isValidDate(date))) {
                throw new BadRequestException('Epoch date is not valid.');
              }
              this.launchEpochTime = DateHandler.getMomentOfString(date);
              this.diffSeconds = await DateHandler.diffSeconds(date);
              break;
            default:
          }
          return 0;
        }),
    );
  }
}

module.exports = MetaData;
