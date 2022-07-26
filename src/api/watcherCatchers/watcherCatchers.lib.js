const moment = require('moment');
const DateHandler = require('../../lib/date-handler');
const EngineCommand = require('../../lib/engine-command');
const SftpHandler = require('../../lib/sftp-handler');
const SshHandler = require('../../lib/ssh-handler');

class WatcherCatchersLib {
  static async putParametersRemoteServer(
    remoteFolder,
    remoteInputFilePath,
    remoteOutputFilePath,
    epochTime,
    endTime,
    x,
    y,
    z,
    altitude,
    fieldOfView,
  ) {
    const sshHandler = new SshHandler();
    const sftpHandler = new SftpHandler();
    const mkdirResult = await sftpHandler.mkdir(remoteFolder);
    if (!mkdirResult) {
      throw new Error(
        `Mkdir for parameter file failed. Path : ${remoteFolder}`,
      );
    }
    const paramtersText = await this.makeParametersToText(
      remoteInputFilePath,
      epochTime,
      endTime,
      x,
      y,
      z,
      altitude,
      fieldOfView,
      remoteOutputFilePath,
    );
    const putFileResult = await sshHandler.writeTextToFile(
      paramtersText,
      remoteInputFilePath,
    );
    if (!putFileResult) {
      throw new Error(`Put parameter file failed. Path : ${remoteFilePath}`);
    }
  }

  static async makeParametersToText(
    remoteFilePath,
    epochTime,
    endTime,
    x,
    y,
    z,
    altitude,
    fieldOfView,
    remoteOutputFilePath,
  ) {
    const juliaPath =
      '/data/COOP/InterfaceForExternalLib/Julia/CoordinateConversion.jl';
    // let epochTimeOfWatchWindow = [year, month, date, hours, minutes, seconds];
    console.log(epochTime);
    epochTime = moment(epochTime);
    endTime = moment(endTime);
    console.log(epochTime);
    const year = epochTime.year();
    const month = epochTime.month() + 1;
    const date = epochTime.date();
    const hours = epochTime.hours();
    const minutes = epochTime.minutes();
    const seconds = epochTime.seconds();
    const watchWindowLength = endTime.diff(epochTime, 'seconds'); // sec
    const inteferenceRadius = 100; // km
    const cameraAngle = fieldOfView;
    const timeIncrement = 10; // sec
    return `${remoteFilePath} ${juliaPath} ${year} ${month} ${date} ${hours} ${minutes} ${seconds} ${watchWindowLength} 0 ${altitude} ${inteferenceRadius} ${cameraAngle} ${timeIncrement} ${x} ${y} ${z} ${remoteOutputFilePath}`;
  }

  static async getFileFromRemoteServer(remoteOutputFilePath, localOutputPath) {
    const sftpHandler = new SftpHandler();
    const getFileResult = await sftpHandler.getFile(
      remoteOutputFilePath,
      localOutputPath,
    );
    if (!getFileResult) {
      throw new Error('get lpdb file from Remote server failed.');
    }
  }

  static makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    return {
      remoteFolder,
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      localOutputPath: `public/uploads/out_${filename}`,
    };
  }

  static async sshExec(remoteInputFilePath, remoteOutputFilePath, threshold) {
    const sshHandler = new SshHandler();
    const command =
      EngineCommand.getWatcherCatchersCommand(remoteInputFilePath);
    console.log(command);
    const { result, message } =
      await sshHandler.execCalculateWithoutCheckingError(command);
    if (result !== 0) {
      throw new Error(message);
    }
  }
}

module.exports = WatcherCatchersLib;

/* ISSUES
 * forEach, map ??
 * .exec()
 * subscrive는 왜 __v 밑에?
 *
 * unlink는 위험한 코드 아닐까..?
 * slash in filename -> underscore보다 hyphen이 나을 것 같기도 하고,,
 * 빈스톡에서 ssh와 sftp가 없어서 s3로 바꿀수도?
 */
