/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const PpdbService = require('./ppdb.service');
const DateHandler = require('../../lib/date-handler');
const PpdbHandler = require('../../lib/ppdb-handler');
const SftpHandler = require('../../lib/sftp-handler');

class PpdbTask {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  /** @param { PpdbService } ppdbService */
  constructor(ppdbService) {
    this.name = 'PPDB TASK';
    this.period = '0 0 2 * * *';
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
    const ppdbFileName = DateHandler.getFileNameByDateObject(dateObj);
    const ppdbPath = `./public/ppdb/${ppdbFileName}.txt`;
    try {
      await this.sftpHandler.connect();
      await this.sftpHandler.getFile(this.#FROM_PPDB_PATH, ppdbPath);
      const ppdbFile = await PpdbHandler.readPpdbFileFromLocal(ppdbPath);
      await this.ppdbService.clearPpdbDatabase();
      await this.ppdbService.savePpdbOnDatabase(dateObj, ppdbFile);
      console.log(`Save PPDB at: ${dateObj}`);
    } catch (err) {
      console.log(err);
    } finally {
      await this.sftpHandler.end();
      console.log('ppdb scheduler finish.');
      this.excuting = false;
    }
  }
}

module.exports = PpdbTask;
