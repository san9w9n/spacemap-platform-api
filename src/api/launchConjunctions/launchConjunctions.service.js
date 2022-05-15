/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
// const LaunchConjunctionsModel = require('./launchConjunctions.model');
const SshHandler = require('../../lib/ssh-handler');
const SftpHandler = require('../../lib/sftp-handler');
const EngineCommand = require('../../common/engineCommand');
const LaunchConjunctionsModel = require('./launchConjunctions.model');
const LpdbModel = require('../lpdb/lpdb.model');
const LpdbService = require('../lpdb/lpdb.service');

class LaunchConjunctionsService {
  /** @param { LpdbService } lpdbService */
  constructor(lpdbService) {
    this.lpdbService = lpdbService;
  }

  async readLaunchConjunctions(email) {
    const result = await LaunchConjunctionsModel.find({ email });
    return result;
  }

  async findLauncConjunctions(taskId) {
    const taskResult = await LaunchConjunctionsModel.findOne({ taskId });
    const { placeId } = taskResult;
    const lpdbResult = await LpdbModel.find(placeId);
    const launchConjunctionsResult = {
      trajectoryFilePath: taskResult.trajectoryPath,
      predictionEpochTime: taskResult.predictionEpochTime,
      launchEpochTime: taskResult.launchEpochTime,
      lpdb: lpdbResult,
    };
    return launchConjunctionsResult;
  }

  async deleteLaunchConjunctions(taskId) {
    const result = await LpdbModel.findOneAndDelete({ taskId });
    return result;
  }

  async enqueTask(email, trajectoryPath, launchEpochTime, predictionEpochTime) {
    const result = await LaunchConjunctionsModel.create({
      email,
      trajectoryPath,
      status: 'PENDING',
      launchEpochTime,
      predictionEpochTime,
    });
    return result;
  }

  async executeToPredictLaunchConjunctions(task, email, file, threshold) {
    const { path } = file;
    const { filename } = file;
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    const remoteInputFilePath = `${remoteFolder}${filename}`;
    const remoteOutputFilePath = `${remoteFolder}out_${filename}`;
    const localOutputPath = `public/uploads/out_${filename}`;

    const sftpHandler = new SftpHandler();

    await sftpHandler.connect();
    await sftpHandler.mkdir(remoteFolder);
    await sftpHandler.putFile(path, remoteInputFilePath);
    await sftpHandler.end();

    const sshHandler = new SshHandler();
    const command = await EngineCommand.predictLaunchConjunction(
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold
    );
    let exitCode = await sshHandler.exec(command);
    exitCode = Number(exitCode);
    // console.log(exitCode);
    // await sshHandler.end();
    if (exitCode === 0) {
      await sftpHandler.connect();
      await sftpHandler.getFile(remoteOutputFilePath, localOutputPath);
      await sftpHandler.end();
      await this.lpdbService.saveLpdbOnDatabase(localOutputPath, task.id);
    }

    // return [launchEpochTime, exitCode, localOutputPath];
    await this.updateTaskStatus(task, exitCode, localOutputPath);
  }

  async updateTaskStatus(task, exitCode, lpdbFilePath) {
    if (exitCode === 0) {
      // console.log('task: ', task);
      const result = await LaunchConjunctionsModel.findOneAndUpdate(
        { task },
        { status: 'DONE', lpdbFilePath }
      );
      return result;
    }
    // const result = await LaunchConjunctionsModel.findOneAndUpdate(
    //   { task },
    //   { status: `Error - ${exitCode}`, lpdbFilePath }
    // );
    const result = await LaunchConjunctionsModel.findOneAndUpdate(
      { task },
      { status: 'ERROR', lpdbFilePath }
    );
    return result;
  }
}
module.exports = LaunchConjunctionsService;
