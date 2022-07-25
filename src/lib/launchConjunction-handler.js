const EngineCommand = require('./engine-command');

class LaunchConjunctionsHandler {
  static makeFilePath(email, filename) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    console.log(remoteFolder);
    const outputName = `${filename.split('.txt')[0]}-LPDB.txt`;
    return {
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      s3InputFileKey: `lca/input/${email}/${filename}`,
      s3OutputFileKey: `lca/output/${email}/${outputName}`,
    };
  }
}

module.exports = LaunchConjunctionsHandler;
