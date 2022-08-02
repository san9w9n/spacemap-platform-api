/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const LaunchConjunctionsModel = require('./launchConjunctions.model');
const { default: mongoose } = require('mongoose');
const {
  LaunchConjunctionsModel,
  LaunchTaskModel,
} = require('./launchConjunctions.model');
const LpdbModel = require('./lpdb.model');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class LaunchConjunctionsService {
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

  async enqueTask(trajectory, s3Path, predictionEpochTime, threshold) {
    if (!s3Path) {
      throw new BadRequestException('No path info.');
    }

    const result = await LaunchConjunctionsModel.create({
      email: trajectory.email,
      trajectoryPath: s3Path,
      status: 'PENDING',
      launchEpochTime: trajectory.metaData.launchEpochTime,
      predictionEpochTime,
      trajectoryLength: trajectory.trajectoryLength,
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
    return taskId;
  }
}

module.exports = LaunchConjunctionsService;
