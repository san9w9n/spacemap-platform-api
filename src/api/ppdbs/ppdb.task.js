/* eslint-disable no-multi-str */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

// const cron = require('node-cron');
const Client = require('ssh2-sftp-client');
const fs = require('fs');
const { promisify } = require('util');
const { getStringFormatData } = require('../../lib/date-formatter');

const FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

const readFilePromise = promisify(fs.readFile);

class PpdbTask {
  #sftp = new Client();

  constructor() {
    this.name = 'PPDB TASK';
    this.period = '*/10 * * * * *';
    this.handler = this.#ppdbScheduleHandler.bind(this);
  }

  async #ppdbScheduleHandler() {
    const dateObj = new Date();
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const hours = dateObj.getUTCHours();
    const date = getStringFormatData(year, month, day, hours);
    const ppdbPath = `./public/ppdb/${date}.txt`;
    const ppdbStream = fs.createWriteStream(ppdbPath);

    try {
      await this.#connect();
      await this.#savePPDBFileBySFTP(ppdbStream);
      const ppdbFile = await this.#readPPDBFileFromLocal(ppdbPath);
      console.log(ppdbFile);
    } catch (err) {
      console.error(err);
    } finally {
      await this.#end();
    }
  }

  async #connect() {
    return this.#sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });
  }

  async #savePPDBFileBySFTP(destStream) {
    return this.#sftp.get(FROM_PPDB_PATH, destStream);
  }

  async #readPPDBFileFromLocal(path) {
    return readFilePromise(path, {
      encoding: 'utf-8',
    });
  }

  async #end() {
    return this.#sftp.end();
  }
}

module.exports = PpdbTask;
