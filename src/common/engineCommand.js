class EngineCommand {
  constructor() {
    this.engine = '/home/jhcha/COOP_LNX_SGP4_06/COOPLauncher_LNX.out';
    this.homeDirectory = '/data/COOP/workingFolder';
    this.predictionCommand =
      '/data/COOP/workingFolder/Prediction_Command_OLD.txt';
    // cd /home/coop/COOP/ && ${coop_engine} ${prediction_command} PHANPROP 0 96 ${threshold} ${input_file_path} ${output_file_path}
  }

  static async predictLaunchConjunction() {
    return this.engine;
  }
}

module.exports = EngineCommand;
