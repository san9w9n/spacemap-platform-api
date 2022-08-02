const EngineCommand = require('../../lib/engine-command');

class WatcherCatcherLib {
  static makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    return {
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      s3OutputFileKey: `wc/output/${email}/${filename}`,
    };
  }
}

module.exports = WatcherCatcherLib;
