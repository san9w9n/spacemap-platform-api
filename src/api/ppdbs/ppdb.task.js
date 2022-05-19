/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const PpdbService = require('./ppdb.service');
const DateHandler = require('../../lib/date-handler');
const PpdbHandler = require('../../lib/ppdb-handler');
const SftpHandler = require('../../lib/sftp-handler');
const EngineCommand = require('../../lib/engine-command');

class PpdbTask {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  /** @param { PpdbService } ppdbService */
  constructor(ppdbService) {
    this.name = 'PPDB TASK';
    // this.period = '*/10 * * * * *';
    // this.period = '0 0 15 * * *';
    this.excuting = false;
    this.handler = this.#ppdbScheduleHandler.bind(this);
    this.sftpHandler = new SftpHandler();
    this.ppdbService = ppdbService;
  }

  async #ppdbScheduleHandler(dateObj) {
    if (this.excuting) {
      return;
    }
    this.excuting = true;
    console.log('ppdb scheduler start.');
    const currDateFileName = DateHandler.getFileNameByDateObject(dateObj);
    const ppdbPath = `./public/ppdb/${currDateFileName}.txt`;
    const tlePath = `./public/tle/${currDateFileName}.tle`;
    const today = DateHandler.getCurrentUTCDate();
    const year = today.getFullYear();
    const month = today.getUTCMonth();
    const date = today.getDate();
    const tleFile = `${currDateFileName}.tle`;
    const predictionCommand = EngineCommand.makePredictionCommandContext(
      tleFile,
      year,
      month,
      date
    );
    console.log(predictionCommand);
    try {
      const getFileResult = await this.sftpHandler.getFile(
        this.#FROM_PPDB_PATH,
        ppdbPath
      );
      if (!getFileResult) {
        throw new Error('getFile failed');
      }
      const ppdbFile = await PpdbHandler.readPpdbFileFromLocal(ppdbPath);
      await this.ppdbService.clearPpdbDatabase();
      await this.ppdbService.savePpdbOnDatabase(dateObj, ppdbFile);
      console.log(`Save PPDB at: ${dateObj}`);
    } catch (err) {
      console.error(err);
    } finally {
      console.log('ppdb scheduler finish.');
      this.excuting = false;
    }
  }
}

module.exports = PpdbTask;
