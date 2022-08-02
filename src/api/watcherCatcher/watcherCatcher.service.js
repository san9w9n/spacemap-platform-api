/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const WatcherCatcherModel = require('./watcherCatcher.model');
const { default: mongoose } = require('mongoose');
const Cesium = require('cesium');
const moment = require('moment');
const {
  WatcherCatcherModel,
  WatcherCatcherTaskModel,
} = require('./watcherCatcher.model');
const WcdbModel = require('./wcdb.model');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');
const WatcherCatcherLib = require('./watcherCatcher.lib');

class WatcherCatcherService {
  async readWatcherCatcher(email) {
    const result = await WatcherCatcherModel.find({ email });
    return result;
  }

  async findWatcherCatcher(placeId) {
    const taskResult = await WatcherCatcherModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const wcdbResult = await WcdbModel.find({ placeId });
    const watcherCatcherResult = {
      latitude: taskResult.latitude,
      longitude: taskResult.longitude,
      epochTime: taskResult.epochTime,
      predictionEpochTime: taskResult.predictionEpochTime,
      wcdb: wcdbResult,
    };
    return watcherCatcherResult;
  }

  async deleteWatcherCatcher(placeId) {
    await WatcherCatcherModel.deleteMany({
      _id: mongoose.Types.ObjectId(placeId),
    });
    return WcdbModel.deleteMany({ placeId }).exec();
  }

  async enqueTaskOnDb(taskId, remoteInputFilePath, remoteOutputFilePath) {
    const task = {
      taskId,
      remoteInputFilePath,
      remoteOutputFilePath,
      s3OutputFileKey,
    };
    await WatcherCatcherTaskModel.create(task);
  }

  async enqueTask(
    email,
    latitude,
    longitude,
    altitude,
    fieldOfView,
    epochTime,
    endTime,
    predictionEpochTime,
    threshold,
  ) {
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    const result = await WatcherCatcherModel.create({
      email,
      latitude,
      longitude,
      localX: position.x,
      localY: position.y,
      localZ: position.z,
      altitude,
      fieldOfView,
      status: 'PENDING',
      epochTime,
      endTime,
      predictionEpochTime,
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
    const uniqueSuffix = `${moment().format('YYYY-MM-DD-hh:mm:ss')}`;
    const filename = `${email}-WC-${uniqueSuffix}.txt`;
    const { remoteInputFilePath, remoteOutputFilePath, s3OutputFileKey } =
      WatcherCatcherLib.makeFilePath(email, filename);

    await this.enqueTaskOnDb(
      taskId,
      remoteInputFilePath,
      remoteOutputFilePath,
      s3OutputFileKey,
    );

    return taskId;
  }
}
module.exports = WatcherCatcherService;
