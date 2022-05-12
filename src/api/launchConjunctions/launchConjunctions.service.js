/* eslint-disable class-methods-use-this */
// const LaunchConjunctionsModel = require('./launchConjunctions.model');
const TrajectoryHandler = require('../../lib/trajectory-handler');
const SshHandler = require('../../lib/ssh-handler');
const SftpHandler = require('../../lib/sftp-handler');
const EngineCommand = require('../../common/engineCommand');
const LaunchConjunctionsModel = require('./launchConjunctions.model');

class LaunchConjunctionsService {
  async enqueTask(email, trajectoryPath) {
    await LaunchConjunctionsModel.findOneAndUpdate(
      { email },
      { email, trajectoryPath, status: 'Pending' }
    );
  }

  async executeToPredictLaunchConjunctions(email, file, threshold) {
    const { path } = file;
    const { filename } = file;
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    const remoteInputFilePath = `${remoteFolder}${filename}`;
    const remoteOutputFilePath = `${remoteFolder}out_${filename}`;
    const localOutputPath = `public/uploads/out_${filename}`;
    console.log(remoteFolder);
    await TrajectoryHandler.checkTrajectory(path);

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
    // await sshHandler.connect();
    console.log('connect');
    let exitCode = await sshHandler.exec(command);
    exitCode = Number(exitCode);
    console.log(exitCode);
    // await sshHandler.end();
    if (exitCode === 0) {
      await sftpHandler.connect();
      await sftpHandler.getFile(remoteOutputFilePath, localOutputPath);
      await sftpHandler.end();
    }
  }
}
module.exports = LaunchConjunctionsService;
