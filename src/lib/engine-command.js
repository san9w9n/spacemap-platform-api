class EngineCommand {
  static engine = '/home/coop/COOP/COOPLauncher_LNX.out';

  static homeDirectory = '/data/COOP/workingFolder/';

  static predictionCommand = '/data/COOP/workingFolder/Prediction_Command.txt';

  static maximumCores = 256;

  static getCalculateCommand(inputFilePath, outputFilePath, threshold) {
    return `${this.engine} ${this.predictionCommand} PHANPROP 0 ${this.maximumCores} ${threshold} ${inputFilePath} ${outputFilePath}`;
  }
}

module.exports = EngineCommand;
