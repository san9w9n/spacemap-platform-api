/* eslint-disable no-multi-str */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

// const cron = require('node-cron');
const Client = require('ssh2-sftp-client');

class PpdbTask {
  constructor() {
    this.sftp = new Client();
  }

  async connect() {
    await this.sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });
  }

  async getPPDBFile() {
    await this.sftp.fastGet(
      '/data/COOP/workingFolder/PPDB2.txt',
      './public/PPDB2.txt'
    );
  }
}

module.exports = PpdbTask;
