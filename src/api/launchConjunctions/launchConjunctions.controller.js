/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const TrajectoryHandler = require('../../lib/trajectory-handler');
const DateHandler = require('../../lib/date-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
const upload = require('../../lib/file-upload');
const {
  BadRequestException,
  ForbiddenException,
} = require('../../common/exceptions');
const { verifyUser } = require('../../middlewares/auth.middleware');

class LaunchConjunctionsController {
  /** @param { LaunchConjunctionsService } launchConjunctionsService */
  constructor(launchConjunctionsService) {
    this.launchConjunctionsService = launchConjunctionsService;
    this.path = '/launch-conjunctions';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readLaunchConjunctions.bind(this)))
      .get('/:dbId', wrapper(this.findLaunchConjunctions.bind(this)))
      .delete('/:dbId', wrapper(this.deleteLaunchConjunctions.bind(this)))
      .post(
        '/',
        upload.single('trajectory'),
        wrapper(this.predictLaunchConjunctions.bind(this)),
      );
  }

  async readLaunchConjunctions(req, _res) {
    const { email } = req.user;
    const data = await this.launchConjunctionsService.readLaunchConjunctions(
      email,
    );
    return { data };
  }

  async findLaunchConjunctions(req, _res) {
    const { email } = req.user;
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Param is empty.');
    }
    const data = await this.launchConjunctionsService.findLaunchConjunctions(
      dbId,
    );
    return { data };
  }

  async deleteLaunchConjunctions(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Wrong param.');
    }
    const data = await this.launchConjunctionsService.deleteLaunchConjunctions(
      dbId,
    );
    return { data };
  }

  async predictLaunchConjunctions(req, _res) {
    if (!DateHandler.isCalculatableDate()) {
      throw new ForbiddenException('Not available time.');
    }
    const { file } = req;
    if (!file) {
      throw new BadRequestException('No File.');
    }
    const { path } = file;
    const { threshold } = req.body;
    if (!path || !threshold) {
      throw new BadRequestException('Empty Trajectory field.');
    }
    const { email } = req.user;
    const [launchEpochTime, predictionEpochTime, trajectoryLength] =
      await TrajectoryHandler.checkTrajectoryAndGetLaunchEpochTime(path);
    const taskId = await this.launchConjunctionsService.enqueTask(
      email,
      file,
      launchEpochTime,
      predictionEpochTime,
      trajectoryLength,
      threshold,
    );

    return {
      message: 'Request success.',
      data: {
        taskId,
      },
    };
  }
}

module.exports = LaunchConjunctionsController;
