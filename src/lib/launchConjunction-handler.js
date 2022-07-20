const EngineCommand = require('./engine-command');
const SftpHandler = require('./sftp-handler');
const SshHandler = require('./ssh-handler');

class LaunchConjunctionsHandler {
  static async putTrajectoryFileOnRemoteServer(
    remoteFolder,
    localFilePath,
    remoteFilePath,
  ) {
    const sftpHandler = new SftpHandler();
    const mkdirResult = await sftpHandler.mkdir(remoteFolder);
    if (!mkdirResult) {
      throw new Error(
        `Mkdir for trajectory file failed. Path : ${remoteFolder}`,
      );
    }
    const putFileResult = await sftpHandler.putFile(
      localFilePath,
      remoteFilePath,
    );
    if (!putFileResult) {
      throw new Error(`Put Trajectory file failed. Path : ${remoteFilePath}`);
    }
  }

  static async getFileFromRemoteServer(remoteOutputFilePath, localOutputPath) {
    const sftpHandler = new SftpHandler();
    const getFileResult = await sftpHandler.getFile(
      remoteOutputFilePath,
      localOutputPath, // localOutputPath
    );
    if (!getFileResult) {
      throw new Error('get lpdb file from Remote server failed.');
    }
  }

  static makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    const outputName = `${filename.split('.txt')[0]}-LPDB.txt`;
    console.log(remoteFolder);
    return {
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      s3InputFileKey: `lca/input/${email}/${filename}`,
      s3OutputFileKey: `lca/output/${email}/${outputName}`,
    };
  }

  static async sshExec(remoteInputFilePath, remoteOutputFilePath, threshold) {
    const sshHandler = new SshHandler();
    const command = EngineCommand.getLaunchCojunctionsAssessmentCommand(
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold,
    );
    console.log(command);
    const { result, message } = await sshHandler.execCalculate(command);
    if (result !== 0) {
      throw new Error(message);
    }
  }
}

module.exports = LaunchConjunctionsHandler;
