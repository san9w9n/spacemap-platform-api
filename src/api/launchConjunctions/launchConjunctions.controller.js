/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
const TrajectoryHandler = require('../../lib/trajectory-handler');
const S3Handler = require('../../lib/s3-handler');
const DateHandler = require('../../lib/date-handler');
const { memoryUpload } = require('../../lib/file-upload');
const {
  isValidTrajectory,
  uploadToS3,
} = require('../../middlewares/trajectory.s3.middleware');

const {
  BadRequestException,
  ForbiddenException,
} = require('../../common/exceptions');
const { verifyUser } = require('../../middlewares/auth.middleware');
const {
  putTrajectoryFileOnRemoteServer,
} = require('../../lib/launchConjunction-handler');
const { parseTrajectory } = require('../../lib/trajectory-handler');

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
    // const { email } = request.user;
    const email = 'sjb9902@hanyang.ac.kr';
    const { file } = req;
    const { threshold } = req.body;

    // 1. validation -> trajectory handler로 변경
    await isValidTrajectory(file, threshold);

    // 2. parse and change
    const {
      timeAndPositionArray,
      coordinateSystem,
      site,
      launchEpochTime,
      trajectoryLength,
    } = await TrajectoryHandler.parseTrajectoryAndGetInfo(file);

    // 3. update buffer
    file.buffer = await TrajectoryHandler.updateTrajectoryBuffer(
      timeAndPositionArray,
      coordinateSystem,
      site,
      launchEpochTime,
    );

    // 4. s3 upload
    const s3FileName = await uploadToS3(email, file);

    // 5. get s3 download link
    const s3Handler = new S3Handler();
    const path = await s3Handler.getS3ObjectUrl(s3FileName);

    // 6. get prediction time
    const predictionEpochTime =
      await DateHandler.getStartMomentOfPredictionWindow();
    console.log(predictionEpochTime);

    // 7. enque on db
    const taskId = await this.launchConjunctionsService.enqueTask(
      email,
      path,
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
