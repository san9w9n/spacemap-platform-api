/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

const moment = require('moment');
const DateHandler = require('./date-handler');
const StringHandler = require('./string-handler');
const { BadRequestException } = require('../common/exceptions');
const { promiseReadFile, promiseWriteFile } = require('./promise-io');

class TrajectoryHandler {
  static #isAllValidParams(time, x, y, z) {
    return (
      StringHandler.isValidString(time) &&
      StringHandler.isValidString(x) &&
      StringHandler.isValidString(y) &&
      StringHandler.isValidString(z)
    );
  }

  static async #getMetaData(splitedLines) {
    const metaData = {};
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
              metaData.coordinateSystem = data;
              break;
            case '%site':
              metaData.site = data;
              break;
            case '%epochtime':
              // eslint-disable-next-line no-case-declarations
              const date = splitedLine.slice(1).join(':');
              if (!(await DateHandler.isValidDate(date))) {
                throw new BadRequestException('Epoch date is not valid.');
              }
              metaData.launchEpochTime = DateHandler.getMomentOfString(date);
              metaData.diffSeconds = await DateHandler.diffSeconds(date);
              break;
            default:
          }
          return 0;
        }),
    );
    const { coordinateSystem, site, launchEpochTime } = metaData;
    if (!coordinateSystem || !site || !launchEpochTime) {
      throw new BadRequestException('Cannot parse trajectory files.');
    }
    return metaData;
  }

  static #getChangedTrajectory(
    timeAndPosition,
    coordinateSystem,
    site,
    launchEpochTime,
  ) {
    const stringTimeAndPosition = timeAndPosition.join('');
    const stringCoordinate = `%coordinate system: ${coordinateSystem}\n`;
    const stringSite = `%site: ${site}\n`;
    const stringLaunchEpochTime = `%epochtime: ${moment(
      launchEpochTime,
    ).toISOString()}\n`;
    return `${stringCoordinate}${stringSite}${stringLaunchEpochTime}${stringTimeAndPosition}`;
  }

  static async #trajectoryParseAndChange(trajcetory) {
    const splitedLines = trajcetory.split(/[\r\n]+/);
    if (!StringHandler.isValidString(splitedLines))
      throw new BadRequestException('Trajectory file is empty');

    const { coordinateSystem, site, launchEpochTime, diffSeconds } =
      await this.#getMetaData(splitedLines);

    let startMomentOfFlight;
    let endMomentOfFlight;
    const timeAndPositionArray = splitedLines
      .filter((line) => StringHandler.isNotComment(line))
      .map((line) => {
        const words = line.split(/[\t\s,]+/);
        const [time, x, y, z] = words;
        if (!this.#isAllValidParams(time, x, y, z)) {
          throw new BadRequestException('Invalid trajectory file.');
        }
        if (startMomentOfFlight === undefined) {
          startMomentOfFlight = Number(time);
        }
        endMomentOfFlight = Number(time);
        return `${Number(time) + diffSeconds}\t${x}\t${y}\t${z}\n`;
      });

    const trajectoryLength = endMomentOfFlight - startMomentOfFlight;
    return {
      timeAndPositionArray,
      coordinateSystem,
      site,
      launchEpochTime,
      trajectoryLength,
    };
  }

  static async #writeTrajectory(filePath, trajectory) {
    return promiseWriteFile(filePath, trajectory, {
      encoding: 'utf-8',
    });
  }

  static async #openTrajectory(filePath) {
    return promiseReadFile(filePath, {
      encoding: 'utf-8',
    });
  }

  static async checkTrajectoryAndGetLaunchEpochTime(filePath) {
    console.log('check trrajectory start');
    const trajectory = await this.#openTrajectory(filePath);
    console.log(trajectory);
    const {
      timeAndPositionArray,
      coordinateSystem,
      site,
      launchEpochTime,
      trajectoryLength,
    } = await this.#trajectoryParseAndChange(trajectory);
    const changedTrajectory = this.#getChangedTrajectory(
      timeAndPositionArray,
      coordinateSystem,
      site,
      launchEpochTime,
    );
    await this.#writeTrajectory(filePath, changedTrajectory);
    const startMomentOfPredictionWindow =
      await DateHandler.getStartMomentOfPredictionWindow();
    return [launchEpochTime, startMomentOfPredictionWindow, trajectoryLength];
  }
}

module.exports = TrajectoryHandler;
