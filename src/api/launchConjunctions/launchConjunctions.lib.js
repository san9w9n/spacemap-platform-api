const EngineCommand = require('../../lib/engine-command');

class LaunchConjunctionsLib {
  static makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    console.log(remoteFolder);
    return {
      remoteFolder,
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      localOutputPath: `public/uploads/out_${filename}`,
    };
  }
}

module.exports = LaunchConjunctionsLib;
