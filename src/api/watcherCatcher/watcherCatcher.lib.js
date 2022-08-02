const EngineCommand = require('../../lib/engine-command');

class WatcherCatcherLib {
  static makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    return {
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
    };
  }
}

module.exports = WatcherCatcherLib;
