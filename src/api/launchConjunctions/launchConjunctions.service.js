/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const LaunchConjunctionsModel = require('./launchConjunctions.model');
const { default: mongoose } = require('mongoose');
const { Mutex } = require('async-mutex');
const SshHandler = require('../../lib/ssh-handler');
const SftpHandler = require('../../lib/sftp-handler');
const EngineCommand = require('../../common/engineCommand');
const LaunchConjunctionsModel = require('./launchConjunctions.model');
const LpdbModel = require('../lpdb/lpdb.model');
const LpdbService = require('../lpdb/lpdb.service');
const { BadRequestException } = require('../../common/exceptions');

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

  async findLauncConjunctions(placeId) {
    const taskResult = await LaunchConjunctionsModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const lpdbResult = await LpdbModel.find({});
    const launchConjunctionsResult = {
      trajectoryPath: taskResult.trajectoryPath,
      lpdbFilePath: taskResult.lpdbFilePath,
      predictionEpochTime: taskResult.predictionEpochTime,
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

  async enqueTask(email, trajectoryPath, launchEpochTime, predictionEpochTime) {
    const result = await LaunchConjunctionsModel.create({
      email,
      trajectoryPath,
      status: 'PENDING',
      launchEpochTime,
      predictionEpochTime,
    });
    // eslint-disable-next-line no-underscore-dangle
    return result._id.toString();
  }

  #makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    return {
      remoteFolder,
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      localOutputPath: `public/uploads/out_${filename}`,
    };
  }

  async #putTrajectoryFileOnRemoteServer(
    remoteFolder,
    localFilePath,
    remoteFilePath
  ) {
    console.log('Mkdir Start');
    const sftpHandler = new SftpHandler();
    const mkdirResult = await sftpHandler.mkdir(remoteFolder);
    if (!mkdirResult) {
      throw new Error(
        `Mkdir for trajectory file failed. Path : ${remoteFolder}`
      );
    }
    console.log('mkdir end. Put File Start');
    const putFileResult = await sftpHandler.putFile(
      localFilePath,
      remoteFilePath
    );
    if (!putFileResult) {
      throw new Error(`Put Trajectory file failed. Path : ${remoteFilePath}`);
    }
    console.log('Put Trajectory File On remote server success.');
  }

  async #sshExec(remoteInputFilePath, remoteOutputFilePath, threshold) {
    console.log('Start excuting calculate program.');
    const sshHandler = new SshHandler();
    const command = EngineCommand.predictLaunchConjunction(
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold
    );
    const { result, message } = await sshHandler.exec(command);
    if (result !== 0) {
      throw new Error(message);
    }
    console.log('Calculate Program success.');
  }

  async #getFileFromRemoteServer(remoteOutputFilePath, localOutputPath) {
    console.log('Start Getting lpdb file from Remote server.');
    const sftpHandler = new SftpHandler();
    const getFileResult = await sftpHandler.getFile(
      remoteOutputFilePath,
      localOutputPath
    );
    if (!getFileResult) {
      throw new Error('get lpdb file from Remote server failed.');
    }
    console.log('Get Result File From remote server success.');
  }

  async #updateTaskStatusSuceess(taskId, lpdbFilePath) {
    return LaunchConjunctionsModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', lpdbFilePath }
    );
  }

  async #updateTaskStatusFailed(taskId, lpdbFilePath, errorMessage) {
    const result = await LaunchConjunctionsModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'ERROR', errorMessage, lpdbFilePath }
    );
  }

  async executeToPredictLaunchConjunctions(taskId, email, file, threshold) {
    const { path } = file;
    const { filename } = file;
    const {
      remoteFolder,
      remoteInputFilePath,
      remoteOutputFilePath,
      localOutputPath,
    } = this.#makeFilePath(email, filename);

    try {
      await this.mutex.runExclusive(async () => {
        await this.#putTrajectoryFileOnRemoteServer(
          remoteFolder,
          path,
          remoteInputFilePath
        );
      });
      await this.#sshExec(remoteInputFilePath, remoteOutputFilePath, threshold);
      await this.#getFileFromRemoteServer(
        remoteOutputFilePath,
        localOutputPath
      );
      await this.lpdbService.saveLpdbOnDatabase(
        localOutputPath,
        // eslint-disable-next-line no-underscore-dangle
        taskId
      );
      await this.#updateTaskStatusSuceess(taskId, localOutputPath);
      console.log(`Task ${taskId} has Successfully Done.`);
    } catch (err) {
      await this.#updateTaskStatusFailed(taskId, localOutputPath, err);
      console.log(`Task ${taskId} has not done : ${err}`);
    }
  }
}
module.exports = LaunchConjunctionsService;
