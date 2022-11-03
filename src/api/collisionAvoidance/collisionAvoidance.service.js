/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const { default: mongoose } = require('mongoose');
const moment = require('moment');
const {
  CollisionAvoidanceModel,
  ColaTaskModel,
} = require('./collisionAvoidance.model');
const CollisionAvoidanceLib = require('./collisionAvoidance.lib');
const PpdbModel = require('../ppdbs/ppdb.model');
const ColadbModel = require('./coladb.model');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class CollisionAvoidanceService {
  async readCollisionAvoidance(email) {
    const result = await CollisionAvoidanceModel.find({ email });
    return result;
  }

  async findCollisionAvoidance(placeId) {
    const taskResult = await CollisionAvoidanceModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const coladbResult = await ColadbModel.find({ placeId });

    const collisionAvoidanceResult = {
      pIdOfConjunction: taskResult.pIdOfConjunction,
      sIdOfConjunction: taskResult.sIdOfConjunction,
      predictionEpochTime: taskResult.predictionEpochTime,
      colaEpochTime: taskResult.colaEpochTime,
      startMomentOfCola: taskResult.startMomentOfCola,
      endMomentOfCola: taskResult.endMomentOfCola,
      amountOfLevel: taskResult.amountOfLevel,
      numberOfPaths: taskResult.numberOfPaths,
      avoidanceLength: taskResult.avoidanceLength,
      threshold: taskResult.threshold,
      candidatedPaths: taskResult.candidatedPaths,
      coladb: coladbResult,
    };
    return collisionAvoidanceResult;
  }

  async deleteCollisionAvoidance(placeId) {
    await CollisionAvoidanceModel.deleteMany({
      _id: mongoose.Types.ObjectId(placeId),
    });
    return ColadbModel.deleteMany({ placeId }).exec();
  }

  async enqueTaskOnDb(
    taskId,
    s3InputFileKey,
    remoteInputFileListPath,
    remoteInputFilePath,
    remoteInputFilePrefix,
    remoteOutputFilePath,
    s3OutputFileKey,
    threshold,
  ) {
    const task = {
      taskId,
      s3InputFileKey,
      remoteInputFileListPath,
      remoteInputFilePath,
      remoteInputFilePrefix,
      remoteOutputFilePath,
      s3OutputFileKey,
      threshold,
    };
    console.log(await ColaTaskModel.create(task));
  }

  async enqueTask(
    email,
    predictionEpochTime,
    colaEpochTime,
    pIdOfConjunction,
    sIdOfConjunction,
    firstLineOfPrimary,
    secondLineOfPrimary,
    startMomentOfCola,
    endMomentOfCola,
    amountOfLevel,
    numberOfPaths,
    avoidanceLength,
    threshold,
  ) {
    const result = await CollisionAvoidanceModel.create({
      email,
      predictionEpochTime,
      colaEpochTime,
      pIdOfConjunction,
      sIdOfConjunction,
      firstLineOfPrimary,
      secondLineOfPrimary,
      startMomentOfCola,
      endMomentOfCola,
      amountOfLevel,
      numberOfPaths,
      avoidanceLength,
      threshold,
      status: 'PENDING',
    });
    if (!result) {
      throw new HttpException(
        500,
        'Internal server error. (cannot enque task into db.)',
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    const taskId = result._id.toString();

    const uniqueSuffix = `${moment().format('YYYY-MM-DD-hh:mm:ss')}`;
    const filename = `${email}-COLA-${uniqueSuffix}`;

    const {
      s3InputFileKey,
      remoteInputFilePath,
      remoteInputFileListPath,
      remoteInputFilePrefix,
      remoteOutputFilePath,
      s3OutputFileKey,
    } = await CollisionAvoidanceLib.makeFilePath(
      email,
      filename,
      numberOfPaths,
    );

    await this.enqueTaskOnDb(
      taskId,
      s3InputFileKey,
      remoteInputFileListPath,
      remoteInputFilePath,
      remoteInputFilePrefix,
      remoteOutputFilePath,
      s3OutputFileKey,
      threshold,
    );

    return taskId;
  }
}
module.exports = CollisionAvoidanceService;
