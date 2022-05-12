class EngineCommand {
  static engine = '/home/jhcha/COOP_LNX_SGP4_06/COOPLauncher_LNX.out';

  static homeDirectory = '/data/COOP/workingFolder/';

  static predictionCommand =
    '/data/COOP/workingFolder/Prediction_Command_OLD.txt';

  static maximumCores = 96;
  // cd /home/coop/COOP/ && ${coop_engine} ${prediction_command} PHANPROP 0 96 ${threshold} ${input_file_path} ${output_file_path}

  static async predictLaunchConjunction(
    inputFilePath,
    outputFilePath,
    threshold
  ) {
    let command = '';
    command += this.engine;
    command += ' ';
    command += this.predictionCommand;
    command += ' ';
    command += 'PHANPROP';
    command += ' ';
    command += '0';
    command += ' ';
    command += this.maximumCores;
    command += ' ';
    command += threshold;
    command += ' ';
    command += inputFilePath;
    command += ' ';
    command += outputFilePath;
    return command;
  }
}

module.exports = EngineCommand;
