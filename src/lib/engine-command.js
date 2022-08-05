class EngineCommand {
  static engine = '/home/coop/COOP/COOPLauncher_LNX.out';

  static homeDirectory = '/data/COOP/workingFolder/';

  static eventSeqDirectory = `${this.homeDirectory}EVENTSEQ`;

  static predictionCommand = `${this.homeDirectory}/Prediction_Command.txt`;

  static maximumCores = 255;

  static startMomentOfPredictionWindow;
}

module.exports = EngineCommand;
