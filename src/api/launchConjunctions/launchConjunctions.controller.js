/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');

const wrapper = require('../../lib/request-handler');
const TrajectoryHandler = require('../../lib/trajectory-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
const upload = require('../../lib/file-upload');

class LaunchConjunctionsController {
  /** @param { LaunchConjunctionsService } launchConjunctionsService */
  constructor(launchConjunctionsService) {
    this.launchConjunctionsService = launchConjunctionsService;
    this.path = '/launch-conjunctions';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.readLaunchConjunctions.bind(this)))
      .get('/:dbId', wrapper(this.findLauncConjunctions.bind(this)))
      .post(
        '/',
        upload.single('trajectory'),
        wrapper(this.predictLaunchConjunctions.bind(this))
      )
      .delete('/:dbId', wrapper(this.deleteLaunchConjunctions.bind(this)));
  }

  async readLaunchConjunctions(req, _res) {
    const email = 'shchoi.vdrc@gmail.com';
    const data = await this.launchConjunctionsService.readLaunchConjunctions(
      email
    );
    return { data };
  }

  async findLauncConjunctions(req, _res) {
    const data = await this.launchConjunctionsService.findLauncConjunctions(
      req.params.dbId
    );
    return { data };
  }

  async predictLaunchConjunctions(req, _res) {
    console.log(req.file);
    // req.user.email = 'shchoi.vdrc@gmail.com';
    const email = 'shchoi.vdrc@gmail.com';
    const [launchEpochTime, predictionEpochTime] =
      await TrajectoryHandler.checkTrajectoryAndGetLaunchEpochTime(
        req.file.path
      );

    const task = await this.launchConjunctionsService.enqueTask(
      email,
      req.file.path,
      launchEpochTime,
      predictionEpochTime
    );
    console.log(`lauched at: ${launchEpochTime}`);
    // const [launchEpochTime, exitCode, lpdbFilePath] =
    this.launchConjunctionsService.executeToPredictLaunchConjunctions(
      task,
      email,
      req.file,
      req.body.threshold
    );
    return { message: 'hi' };
  }

  async deleteLaunchConjunctions(req, _res) {
    const data = await this.launchConjunctionsService.deleteLaunchConjunctions(
      req.params.dbId
    );
    return { data };
  }
}

module.exports = LaunchConjunctionsController;
