/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const moment = require('moment');
const DateHandler = require('../../lib/date-handler');
const PpdbLib = require('./ppdb.lib');
const SftpHandler = require('../../lib/sftp-handler');
const EngineCommand = require('../../lib/engine-command');

class EventseqTask {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  constructor() {
    this.name = 'EVENT TASK';
    this.period = '0 5 15 * * *';
    // this.period = '*/30 * * * * *';
    this.excuting = false;
    this.handler = this.#ppdbScheduleHandler.bind(this);
    this.sftpHandler = new SftpHandler();
  }

  async doEventSeqTask(_req, _res) {
    const date = DateHandler.getCurrentUTCDate();
    await this.#ppdbScheduleHandler(date);
    return {};
  }

  async #ppdbScheduleHandler(dateObj) {
    // if (this.excuting) {
    //   console.log('excuting');
    //   return;
    // }
    this.excuting = true;
    console.log('eventseq scheduler start.');
    console.log(`${new Date()}`);
    const currDateFileName = DateHandler.getFileNameByDateObject(dateObj);
    const ppdbFileName = `${currDateFileName}.txt`;
    const tlePath = `public/tle/${currDateFileName}.tle`;
    const tleFileName = `${currDateFileName}.tle`;

    const tomorrow = moment().add(0, 'd').startOf('hour');
    const year = tomorrow.year();
    const month = tomorrow.month() + 1;
    const date = tomorrow.date();
    const hour = tomorrow.hour();
    // --------------------------calculate PPDB----------------------------//
    try {
      const predictionCommand = EngineCommand.makePredictionCommandContext(
        tleFileName,
        year,
        month,
        date,
        hour,
      );
      DateHandler.setStartMomentOfPredictionWindow(tomorrow.toISOString());
      DateHandler.setEndMomentOfPredictionWindow(
        tomorrow.clone().add(2, 'd').toISOString(),
      );
      await PpdbLib.sshRemoveEventSeq();
      await PpdbLib.sshBackupTle(ppdbFileName, tleFileName);
      await PpdbLib.sshPutPredictionCommand(predictionCommand);
      await this.sftpHandler.putFile(
        tlePath,
        `${EngineCommand.homeDirectory}${tleFileName}`,
      );
      console.log(predictionCommand);
      await PpdbLib.sshExecEvetnSeqGen();
      // await PpdbLib.sshExecCalculatePpdb();
    } catch (err) {
      console.log(err);
    } finally {
      console.log('making ppdb is finished.');
      DateHandler.setStartMomentOfPredictionWindow(tomorrow.toISOString());
      DateHandler.setEndMomentOfPredictionWindow(
        tomorrow.clone().add(2, 'd').toISOString(),
      );
      console.log(`${new Date()}`);
      console.log('eventseq scheduler finish.');
      this.excuting = false;
    }
    // --------------------------calculate PPDB----------------------------//
  }
}
module.exports = EventseqTask;
