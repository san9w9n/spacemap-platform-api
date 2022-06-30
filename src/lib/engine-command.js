class EngineCommand {
  static engine = '/home/coop/COOP/COOPLauncher_LNX.out';

  static homeDirectory = '/data/COOP/workingFolder/';

  static eventSeqDirectory = `${this.homeDirectory}EVENTSEQ`;

  static predictionCommand = `${this.homeDirectory}/Prediction_Command.txt`;

  static maximumCores = 255;

  static startMomentOfPredictionWindow;

  static makePredictionCommandContext(tleFile, year, month, date, hour) {
    const resolution = 100;
    // const predictionWindowLength = 3600;
    const predictionWindowLength = 86400;
    const predictionCommandContext = `${this.homeDirectory} ${tleFile} 0 ${resolution} 1.0e-3 ${predictionWindowLength} ${year} ${month} ${date} ${hour} 0 0`;
    return predictionCommandContext;
  }

  static getEventSeqGenCommand() {
    const threshold = 10;
    return `${this.engine} ${this.predictionCommand} EVENTSEQGEN 0 ${this.maximumCores} ${threshold} -1`;
  }

  static getCaculatePpdbCommand() {
    const threshold = 10;
    return `${this.engine} ${this.predictionCommand} PROXDBGEN2 0 ${this.maximumCores} ${threshold} -1`;
  }

  static getLaunchCojunctionsAssessmentCommand(
    inputFilePath,
    outputFilePath,
    threshold
  ) {
    return `${this.engine} ${this.predictionCommand} PHANPROP 0 ${this.maximumCores} ${threshold} ${inputFilePath} ${outputFilePath}`;
  }

  static getWatcherCatchersCommand(paramFilePath) {
    return `${this.engine} ${this.predictionCommand} INTERFERENCE 0 ${this.maximumCores} ${paramFilePath}`;
  }
}

module.exports = EngineCommand;
