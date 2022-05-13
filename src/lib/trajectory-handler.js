/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const fs = require('fs').promises;
const moment = require('moment');
const { BadRequestException } = require('../common/exceptions');
const {
  startMomentOfPredictionWindow,
  endMomentOfPredictionWindow,
} = require('../common/predictionWindow');

class TrajectoryHandler {
  static async trajectoryParser(trajcetory) {
    let timeAndPosition = '';
    let launchEpochTime;
    let coordinateSystem;
    let site;
    let diffSeconds;
    const splitedLines = trajcetory.split('\n');
    if (splitedLines === null)
      throw new BadRequestException(`Trajectory file is empty`);

    // splitedLines.forEach(async (line) => {
    for await (const line of splitedLines) {
      const words = line.split(/[\t\s,]+/);
      if (words[0] === '%coordinate') {
        [, , coordinateSystem] = words;
        continue;
      }
      if (words[0] === '%site:') {
        [, site] = words;
        continue;
      }
      if (words[0] === '%epochtime:') {
        [, launchEpochTime] = words;
        if (!(await this.isValidDate(launchEpochTime))) {
          throw new BadRequestException(
            `Epochtime of trajectory is out of prediction window. Prediction window is between ${startMomentOfPredictionWindow} and ${endMomentOfPredictionWindow}`
          );
        }
        diffSeconds = await this.diffSeconds(launchEpochTime);
        console.log(`diff: ${diffSeconds}`);
        continue;
      }
      const [time, x, y, z] = words;
      if (time !== '') {
        const changedTime = Number(time) + diffSeconds;
        // console.log(words);
        timeAndPosition += String(changedTime);
        timeAndPosition += '\t';
        timeAndPosition += x;
        timeAndPosition += '\t';
        timeAndPosition += y;
        timeAndPosition += '\t';
        timeAndPosition += z;
        timeAndPosition += '\n';
      }
    }
    return { timeAndPosition, launchEpochTime, coordinateSystem, site };
  }

  static async writeChangedTrajectory(
    filePath,
    timeAndPosition,
    launchEpochTime,
    coordinateSystem,
    site
  ) {
    let changedTrajectory = `%coordinate system: ${coordinateSystem}\n`;
    changedTrajectory += `%epochtime: ${launchEpochTime}\n`;
    changedTrajectory += `%site: ${site}\n`;
    changedTrajectory += timeAndPosition;
    await fs.writeFile(filePath, changedTrajectory, function (err) {
      if (err)
        throw new BadRequestException('Fail to write changed trajectory.');
    });
  }

  static async diffSeconds(launchEpochTime) {
    const diffSeconds = moment(launchEpochTime).diff(
      moment(startMomentOfPredictionWindow),
      'seconds'
    );
    return diffSeconds;
  }

  static async isValidDate(launchEpochTime) {
    if (
      moment(launchEpochTime).isSameOrAfter(
        moment(startMomentOfPredictionWindow)
      ) &&
      moment(launchEpochTime).isSameOrBefore(
        moment(endMomentOfPredictionWindow)
      )
    )
      return true;
    return false;
  }

  static async openTrajectory(filePath) {
    const trajcetory = await fs.readFile(filePath, 'utf8');
    return trajcetory;
  }

  static async checkTrajectoryAndGetLaunchEpochTime(filePath) {
    const trajectory = await this.openTrajectory(filePath);
    const { timeAndPosition, launchEpochTime, coordinateSystem, site } =
      await this.trajectoryParser(trajectory);
    // console.log(timeAndPosition);
    await this.writeChangedTrajectory(
      filePath,
      timeAndPosition,
      launchEpochTime,
      coordinateSystem,
      site
    );
    return [launchEpochTime, moment(startMomentOfPredictionWindow)];
  }
}

module.exports = TrajectoryHandler;
