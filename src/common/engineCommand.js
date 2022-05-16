class EngineCommand {
  static engine = '/home/jhcha/COOP_LNX_SGP4_06/COOPLauncher_LNX.out';

  static homeDirectory = '/data/COOP/workingFolder/';

  static predictionCommand =
    '/data/COOP/workingFolder/Prediction_Command_OLD.txt';

  static maximumCores = 96;

  static predictLaunchConjunction(inputFilePath, outputFilePath, threshold) {
    return `${this.engine} ${this.predictionCommand} PHANPROP 0 ${this.maximumCores} ${threshold} ${inputFilePath} ${outputFilePath}`;
  }
}

module.exports = EngineCommand;
