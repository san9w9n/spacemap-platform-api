const moment = require('moment');
// const DateHandler = require('./date-handler');
const StringHandler = require('./string-handler');
const { promiseReadFile } = require('./promise-io');
const SshHandler = require('./ssh-handler');
const EngineCommand = require('./engine-command');

class PpdbHandler {
  static async #getPpdbObject(createdAt, rawPpdb) {
    const splitPpdb = rawPpdb.split('\t');
    const [
      pid,
      sid,
      dca,
      tca,
      tcaStart,
      tcaEnd,
      year,
      month,
      date,
      hours,
      min,
      sec,
      probability,
    ] = splitPpdb;

    // console.log(`${year}-${month}-${date}T${hours}:${min}:${sec}Z`);
    let standardTime = moment(
      `${year}-${month}-${date}T${hours}:${min}:${
        sec >= 60.0 ? sec - 0.001 : sec
      }Z`,
      'YYYY-MM-DDTHH:mm:ss.SSSSZ',
    );
    const diffTcaStart = tcaStart > tca ? tcaStart - tcaStart : tcaStart - tca;
    const diffTcaEnd = tcaEnd < tca ? tcaEnd - tcaEnd : tcaEnd - tca;
    let tcaStartTime = standardTime.clone().add(diffTcaStart, 'seconds');
    let tcaTime = standardTime.clone().add(0, 'seconds');
    let tcaEndTime = standardTime.clone().add(diffTcaEnd, 'seconds');

    standardTime = new Date(standardTime.toISOString());
    tcaStartTime = new Date(tcaStartTime.toISOString());
    tcaTime = new Date(tcaTime.toISOString());
    tcaEndTime = new Date(tcaEndTime.toISOString());

    return {
      createdAt,
      pid,
      sid,
      dca,
      tcaTime,
      tcaStartTime,
      tcaEndTime,
      standardTime,
      probability,
    };
  }

  static async getPpdbObjectsArray(createdDateObj, ppdbTexts) {
    const ppdbArray = ppdbTexts.split('\n');
    const filteredPpdbs = ppdbArray.filter(StringHandler.isNotComment);
    const ppdbs = await Promise.all(
      filteredPpdbs.map(async rawPpdb => {
        return this.#getPpdbObject(createdDateObj, rawPpdb);
      }),
    );
    return ppdbs;
  }

  static async readPpdbFileFromLocal(path) {
    return promiseReadFile(path, {
      encoding: 'utf-8',
    });
  }

  static async sshRemoveEventSeq() {
    const sshHandler = new SshHandler();
    const command = `rm -rf ${EngineCommand.homeDirectory}EVENTSEQ && rm -rf ${EngineCommand.homeDirectory}Su* && mkdir ${EngineCommand.homeDirectory}EVENTSEQ`;
    console.log(command);
    const { result, message } = await sshHandler.execCalculate(command);
  }

  static async sshBackupTle(ppdbFile, tleFile) {
    const sshHandler = new SshHandler();
    const backupPath = `${EngineCommand.homeDirectory}2022/`;
    const command = `mv -v ${EngineCommand.homeDirectory}PPDB2.txt ${backupPath}PPDB${ppdbFile} && mv -v ${EngineCommand.homeDirectory}*.tle ${backupPath}`;
    console.log(command);
    const { result, message } = await sshHandler.execCalculate(command);
    // if (result !== 0) {
    //   throw new Error(message);
    // }
  }

  static async sshPutPredictionCommand(predictionCommand) {
    const sshHandler = new SshHandler();
    const { result, message } = await sshHandler.writeTextToFile(
      predictionCommand,
      EngineCommand.predictionCommand,
    );
    // if (result !== 0) {
    //   throw new Error(message);
    // }
  }

  static async sshExecEvetnSeqGen() {
    const sshHandler = new SshHandler();
    const eventCommand = EngineCommand.getEventSeqGenCommand();
    const ppdbCommand = EngineCommand.getCaculatePpdbCommand();
    const command = `${eventCommand} > /dev/null  && ${ppdbCommand}`;

    console.log(command);
    const { result, message } = await sshHandler.execCalculate(command);
    if (result !== 0) {
      console.log(message);
      throw new Error(message);
    }
    console.log(`here sshexec result ${message}`);
  }

  static async sshExecCalculatePpdb() {
    const sshHandler = new SshHandler();
    const command = EngineCommand.getCaculatePpdbCommand();
    console.log(command);
    const { result, message } = await sshHandler.execCalculate(command);
    if (result !== 0) {
      throw new Error(message);
    }
  }
}

module.exports = PpdbHandler;
