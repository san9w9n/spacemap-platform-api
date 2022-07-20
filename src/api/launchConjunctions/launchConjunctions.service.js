/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const LaunchConjunctionsModel = require('./launchConjunctions.model');
const { default: mongoose } = require('mongoose');
const { Mutex } = require('async-mutex');
const {
  LaunchConjunctionsModel,
  LaunchTaskModel,
} = require('./launchConjunctions.model');
const LpdbModel = require('../lpdb/lpdb.model');
const LpdbService = require('../lpdb/lpdb.service');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');
const LaunchConjunctionsHandler = require('../../lib/launchConjunction-handler');

class LaunchConjunctionsService {
  /** @param { LpdbService } lpdbService */
  constructor(lpdbService) {
    this.lpdbService = lpdbService;
    this.mutex = new Mutex();
  }

  async readLaunchConjunctions(email) {
    const result = await LaunchConjunctionsModel.find({ email });
    return result;
  }

  async findLaunchConjunctions(placeId) {
    const taskResult = await LaunchConjunctionsModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const lpdbResult = await LpdbModel.find({ placeId });
    const launchConjunctionsResult = {
      trajectoryPath: taskResult.trajectoryPath,
      lpdbFilePath: taskResult.lpdbFilePath,
      predictionEpochTime: taskResult.predictionEpochTime,
      trajectoryLength: taskResult.trajectoryLength,
      launchEpochTime: taskResult.launchEpochTime,
      lpdb: lpdbResult,
    };
    return launchConjunctionsResult;
  }

  async deleteLaunchConjunctions(placeId) {
    await LaunchConjunctionsModel.deleteMany({
      _id: mongoose.Types.ObjectId(placeId),
    });
    return LpdbModel.deleteMany({ placeId }).exec();
  }

  async enqueTaskOnDb(
    taskId,
    s3InputFileKey,
    remoteInputFilePath,
    remoteOutputFilePath,
    s3OutputFileKey,
    threshold,
  ) {
    const task = {
      taskId,
      s3InputFileKey,
      remoteInputFilePath,
      remoteOutputFilePath,
      s3OutputFileKey,
      threshold,
    };
    console.log(await LaunchTaskModel.create(task));
  }

  async popTaskFromDb() {
    const task = await LaunchTaskModel.findOneAndDelete({})
      .sort({ createdAt: 1 })
      .exec();
    return task;
  }

  async enqueTask(
    email,
    s3FileName,
    s3FilePath,
    launchEpochTime,
    predictionEpochTime,
    trajectoryLength,
    threshold,
  ) {
    if (!s3FilePath) {
      throw new BadRequestException('No path info.');
    }
    const result = await LaunchConjunctionsModel.create({
      email,
      trajectoryPath: s3FilePath,
      status: 'PENDING',
      launchEpochTime,
      predictionEpochTime,
      trajectoryLength,
      threshold,
    });
    if (!result) {
      throw new HttpException(
        500,
        'Internal server error. (cannot enque task into db.)',
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    const taskId = result._id.toString();

    const {
      remoteInputFilePath,
      remoteOutputFilePath,
      s3InputFileKey,
      s3OutputFileKey,
    } = LaunchConjunctionsHandler.makeFilePath(email, s3FileName);

    await this.enqueTaskOnDb(
      taskId,
      s3InputFileKey,
      remoteInputFilePath,
      remoteOutputFilePath,
      s3OutputFileKey,
      threshold,
    );

    return taskId;
  }

  async updateTaskStatusSuceess(taskId, lpdbFilePath) {
    return LaunchConjunctionsModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', lpdbFilePath },
    );
  }

  async updateTaskStatusFailed(taskId, lpdbFilePath, errorMessage) {
    const result = await LaunchConjunctionsModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'ERROR', errorMessage, lpdbFilePath },
    );
  }
}
module.exports = LaunchConjunctionsService;
