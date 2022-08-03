const EngineCommand = require('../../lib/engine-command');

class CollisionAvoidanceLib {
  static async makeFilePath(email, filename, numberOfPaths) {
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;

    const remoteInputFilePath = await Promise.all(
      [...Array(numberOfPaths + 1).keys()].map(async (index) => {
        if (index === 0) {
          return `${remoteFolder}${filename}_original.txt`;
        }
        return `${remoteFolder}${filename}_c${index}.txt`;
      }),
    );

    const s3InputFileKey = await Promise.all(
      [...Array(numberOfPaths + 1).keys()].map(async (index) => {
        if (index === 0) {
          return `cola/input/${email}/${filename}_original.txt`;
        }
        return `cola/input/${email}/${filename}_c${index}.txt`;
      }),
    );

    return {
      s3InputFileKey,
      remoteInputFilePath,
      remoteInputFileListPath: `${remoteFolder}${filename}.lst`,
      remoteInputFilePrefix: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}.txt`,
      s3OutputFileKey: `cola/output/${email}/${filename}-COLADB.txt`,
    };
  }
}

module.exports = CollisionAvoidanceLib;
