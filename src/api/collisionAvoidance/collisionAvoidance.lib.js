const moment = require('moment');
const DateHandler = require('../../lib/date-handler');
const EngineCommand = require('../../lib/engine-command');

class CollisionAvoidanceLib {
  static async makeFilePath(email, filename, numberOfPaths) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;

    // s3InputFileKey(배열), s3OutputFileKey
    /// remoteInputFileListPath, remoteInputFilePath(배열), remoteOutputFilePath
    const remoteInputFilePrefix = `${remoteFolder}${filename}`;
    const remoteInputFileListPath = `${remoteFolder}${filename}.lst`;
    const remoteInputFilePath = [];
    const s3InputFileKey = [];
    remoteInputFilePath.push(`${remoteFolder}${filename}_original.txt`);
    s3InputFileKey.push(`cola/input/${email}/${filename}_original.txt`);

    for (let i = 1; i <= numberOfPaths; i++) {
      remoteInputFilePath.push(`${remoteFolder}${filename}_c${i}.txt`);
      s3InputFileKey.push(`cola/input/${email}/${filename}_c${i}.txt`);
    }

    const s3OutputFileKey = `cola/output/${email}/${filename}-COLADB.txt`;
    const remoteOutputFilePath = `${remoteFolder}out_${filename}.txt`;

    return {
      s3InputFileKey,
      remoteInputFileListPath,
      remoteInputFilePath,
      remoteInputFilePrefix,
      remoteOutputFilePath,
      s3OutputFileKey,
    };
  }
}

module.exports = CollisionAvoidanceLib;
