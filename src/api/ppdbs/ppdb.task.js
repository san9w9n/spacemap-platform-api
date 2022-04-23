/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const fs = require('fs');
const { promisify } = require('util');
const Client = require('ssh2-sftp-client');
const PpdbService = require('./ppdb.service');

const ppdbService = new PpdbService();
const readFilePromise = promisify(fs.readFile);
const FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';
class PpdbTask {
  #sftp = new Client();

  constructor() {
    this.name = 'PPDB TASK';
    this.period = '0 0 0 * * *';
    this.handler = this.#ppdbScheduleHandler.bind(this);
  }

  /**
   * @param {String} date
   */
  async #ppdbScheduleHandler(date) {
    const ppdbPath = `./public/ppdb/${date}.txt`;
    try {
      await this.#connectSftp();
      await this.#savePpdbFileFromSftp(ppdbPath);
      const ppdbFile = await this.#readPPDBFileFromLocal(ppdbPath);
      await ppdbService.savePpdbOnDatabase(date, ppdbFile);
    } catch (err) {
      console.error(err);
    } finally {
      await this.#endSftp();
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
