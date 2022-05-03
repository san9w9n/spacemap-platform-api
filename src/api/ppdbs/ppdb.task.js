/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const fs = require('fs');
const { promisify } = require('util');
const Client = require('ssh2-sftp-client');
const PpdbService = require('./ppdb.service');
const DateHandler = require('../../lib/date-handler');

const ppdbService = new PpdbService();
const readFilePromise = promisify(fs.readFile);
const FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';
class PpdbTask {
  #sftp = new Client();

  constructor() {
    this.name = 'PPDB TASK';
    this.period = '0 0 3 * * *';
    this.excuting = false;
    this.handler = this.#ppdbScheduleHandler.bind(this);
  }

  /**
   * @param {Date} dateObj
   */
  async #ppdbScheduleHandler(dateObj) {
    if (!this.excuting) {
      console.log('ppdb scheduler start.');
      this.excuting = true;
      const ppdbFileName = DateHandler.getFileNameByDateObject(dateObj);
      const ppdbPath = `./public/ppdb/${ppdbFileName}.txt`;
      try {
        await this.#connectSftp();
        await this.#savePpdbFileFromSftp(ppdbPath);
        const ppdbFile = await this.#readPPDBFileFromLocal(ppdbPath);
        await ppdbService.savePpdbOnDatabase(dateObj, ppdbFile);
        console.log(`Save PPDB at: ${dateObj}`);
      } catch (err) {
        console.error(err);
      } finally {
        await this.#endSftp();
        this.excuting = false;
        console.log('ppdb scheduler finish.');
      }
    }
  }

  async #connectSftp() {
    return this.#sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });
  }

  async #savePpdbFileFromSftp(path) {
    return this.#sftp.fastGet(FROM_PPDB_PATH, path);
  }

  async #readPPDBFileFromLocal(path) {
    return readFilePromise(path, {
      encoding: 'utf-8',
    });
  }

  async #endSftp() {
    return this.#sftp.end();
  }
}

module.exports = PpdbTask;
