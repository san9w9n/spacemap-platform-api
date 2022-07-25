/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
const DateHandler = require('../../lib/date-handler');
const Trajectory = require('./launchConjunctions.trajectory');
const S3Handler = require('./launchConjunctions.s3handler');
const { memoryUpload } = require('../../lib/file-upload');
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
        memoryUpload.single('trajectory'),
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
    const { email } = req.user;
    const { file } = req;
    const { threshold } = req.body;

    if (!DateHandler.isCalculatableDate()) {
      throw new ForbiddenException('Not available time.');
    }
    if (!file) {
      throw new BadRequestException('No Trajectory File.');
    }
    if (!threshold) {
      throw new BadRequestException('Empty Threshold field.');
    }

    const trajectory = new Trajectory(email, file);
    await trajectory.setMetaData();
    await trajectory.setSecondAndPositions();
    await trajectory.setTrajectoryLength();
    await trajectory.updateFileBuffer();

    const s3Handler = new S3Handler();
    await s3Handler.setS3FileName(trajectory);
    await s3Handler.uploadFile(trajectory);
    await s3Handler.setS3FilePath(trajectory);

    const predictionEpochTime =
      await DateHandler.getStartMomentOfPredictionWindow();

    const taskId = await this.launchConjunctionsService.enqueTask(
      trajectory,
      s3Handler,
      predictionEpochTime,
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
