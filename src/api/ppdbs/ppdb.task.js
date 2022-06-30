/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const moment = require('moment');
const PpdbService = require('./ppdb.service');
const DateHandler = require('../../lib/date-handler');
const PpdbHandler = require('../../lib/ppdb-handler');
const SftpHandler = require('../../lib/sftp-handler');
const SendEmailHandler = require('../../lib/node-mailer');

class PpdbTask {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  /** @param { PpdbService } ppdbService */
  constructor(ppdbService) {
    this.name = 'PPDB TASK';
    this.period = '0 5 23 * * *';
    // this.period = '*/30 * * * * *';
    this.excuting = false;
    this.handler = this.#ppdbScheduleHandler.bind(this);
    this.sftpHandler = new SftpHandler();
    this.ppdbService = ppdbService;
  }

  async doPpdbTask(_req, res) {
    const date = DateHandler.getCurrentUTCDate();
    await this.#ppdbScheduleHandler(date);
    return {};
  }

  async #ppdbScheduleHandler(dateObj) {
    if (this.excuting) {
      return;
    }
    this.excuting = true;
    console.log('ppdb scheduler start.');
    const currDateFileName = DateHandler.getFileNameByDateObject(dateObj);
    const ppdbPath = `./public/ppdb/${currDateFileName}.txt`;
    // -----------------------------get PPDB-------------------------------//
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
      await SendEmailHandler.sendMail(
        '[SPACEMAP] ppdb task 에서 에러가 발생하였습니다.',
        err
      );
    } finally {
      console.log('ppdb scheduler finish.');
      this.excuting = false;
    }

    // -----------------------------get PPDB-------------------------------//
  }
}

module.exports = PpdbTask;
