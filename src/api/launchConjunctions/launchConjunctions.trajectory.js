/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

const moment = require('moment');
const { BadRequestException } = require('../../common/exceptions');
const MetaData = require('./launchConjunctions.metaData');
const SecondAndPosition = require('./launchConjunctions.secondAndPosition');
const StringHandler = require('../../lib/string-handler');

class Trajectory {
  constructor(email, file) {
    this.email = email;
    this.file = file;
    this.splitedLines = undefined;
    this.metaData = new MetaData();
    this.secondAndPositions = undefined;
    this.startMomentOfFlight = undefined;
    this.endMomentOfFlight = undefined;
    this.trajectoryLength = 0;
  }

  async #setSplitedLines(bufferString) {
    this.splitedLines = bufferString.split(/[\r\n]+/);
  }

  async takeChangedTrajectory() {
    const stringSecondAndPositions = this.secondAndPositions.join('');
    const stringCoordinateSystem = `%coordinate system: ${this.metaData.coordinateSystem}\n`;
    const stringSite = `%site: ${this.metaData.site}\n`;
    const stringLaunchEpochTime = `%epochtime: ${moment(
      this.metaData.epochTime,
    ).toISOString()}\n`;
    return `${stringCoordinateSystem}${stringSite}${stringLaunchEpochTime}${stringSecondAndPositions}`;
  }

  async initializeMetaData() {
    this.#setSplitedLines(this.file.buffer.toString());
    if (this.splitedLines.length < 4) {
      throw new BadRequestException('Too short trajectory file.');
    }
    await this.metaData.parseMetaData(this.splitedLines);

    if (!this.metaData.isValidMetaData()) {
      throw new BadRequestException('Invalid meta data.');
    }
  }

  async initializeSecondAndPositions() {
    const secondAndPositions = this.splitedLines
      .filter((line) => StringHandler.isNotComment(line))
      .map((line) => {
        const secondAndPosition = new SecondAndPosition(line);

        if (this.startMomentOfFlight === undefined) {
          this.startMomentOfFlight =
            Number(secondAndPosition.time) + this.metaData.diffSeconds;
        }
        this.endMomentOfFlight =
          Number(secondAndPosition.time) + this.metaData.diffSeconds;

        const oneLine = secondAndPosition.setSecondAndPosition(
          this.metaData.diffSeconds,
        );
        return oneLine;
      });
    this.secondAndPositions = secondAndPositions;
  }

  async initializeTrajectoryLength() {
    this.trajectoryLength = this.endMomentOfFlight - this.startMomentOfFlight;
  }

  async updateTrajectory(changedTrajectory) {
    this.file.buffer = Buffer.from(changedTrajectory);
  }
}

module.exports = Trajectory;
