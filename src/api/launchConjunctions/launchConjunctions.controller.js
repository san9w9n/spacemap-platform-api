/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const TrajectoryHandler = require('../../lib/trajectory-handler');
const DateHandler = require('../../lib/date-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
// const upload = require('../../lib/file-upload');
const upload = require('../../lib/s3-handler');

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
    // this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readLaunchConjunctions.bind(this)))
      .get('/:dbId', wrapper(this.findLaunchConjunctions.bind(this)))
      .delete('/:dbId', wrapper(this.deleteLaunchConjunctions.bind(this)))
      .post(
        '/',
        upload.single('trajectory'),
        wrapper(this.predictLaunchConjunctions.bind(this)), // 아직 동작 안함
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
    console.log('file');
    console.log(file);
    if (!file) {
      throw new BadRequestException('No File.');
    }
    const { location } = file;
    console.log('location', location);
    const { threshold } = req.body;
    if (!location || !threshold) {
      throw new BadRequestException('Empty Trajectory field.');
    }
    // const { email } = req.user;
    const email = 'sjb9902@hanyang.ac.kr';

    // 여기서부터 다시 해야함
    const [launchEpochTime, predictionEpochTime, trajectoryLength] =
      await TrajectoryHandler.checkTrajectoryAndGetLaunchEpochTime(location);
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
