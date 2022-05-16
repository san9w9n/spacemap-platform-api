/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const TrajectoryHandler = require('../../lib/trajectory-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
const upload = require('../../lib/file-upload');
const { BadRequestException } = require('../../common/exceptions');

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
      .delete('/:dbId', wrapper(this.deleteLaunchConjunctions.bind(this)))
      .post(
        '/',
        upload.single('trajectory'),
        wrapper(this.predictLaunchConjunctions.bind(this))
      );
  }

  async readLaunchConjunctions(req, _res) {
    // TODO: 로그인 한 유저의 이메일 -> req.user.email
    const email = 'shchoi.vdrc@gmail.com';
    const data = await this.launchConjunctionsService.readLaunchConjunctions(
      email
    );
    return { data };
  }

  async findLauncConjunctions(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Param is empty.');
    }
    const data = await this.launchConjunctionsService.findLauncConjunctions(
      dbId
    );
    return { data };
  }

  async deleteLaunchConjunctions(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Wrong param.');
    }
    const data = await this.launchConjunctionsService.deleteLaunchConjunctions(
      dbId
    );
    return { data };
  }

  async predictLaunchConjunctions(req, _res) {
    const { file } = req;
    if (!file) {
      throw new BadRequestException('No File.');
    }
    const { path } = file;
    const { threshold } = req.body;
    if (!path || !threshold) {
      throw new BadRequestException('Empty Trajectory field.');
    }
    const email = 'shchoi.vdrc@gmail.com';
    const [launchEpochTime, predictionEpochTime] =
      await TrajectoryHandler.checkTrajectoryAndGetLaunchEpochTime(path);
    const taskId = await this.launchConjunctionsService.enqueTask(
      email,
      path,
      launchEpochTime,
      predictionEpochTime
    );
    this.launchConjunctionsService.executeToPredictLaunchConjunctions(
      taskId,
      email,
      file,
      threshold
    );
    return {
      message: 'Request success.',
      data: {},
    };
  }
}

module.exports = LaunchConjunctionsController;
