/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleService = require('./tle.service');
const DateHandler = require('../../lib/date-handler');
const SendRequestHandler = require('../../lib/sendRequest-handler');
const TleHandler = require('../../lib/tle-handler');
const SendEmailHandler = require('../../lib/node-mailer');

class TleTask {
  #SPACETRACK_URL = 'https://www.space-track.org';

  #AUTH_URL = 'ajaxauth/login';

  #QUERY_URL =
    'basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le';

  /** @param { TleService } tleService */
  constructor(tleService) {
    this.name = 'TLE TASK';
    // this.period = '* * * * * *';
    this.period = '0 0 15 * * *';
    this.excuting = false;
    this.handler = this.#tleScheduleHandler.bind(this);
    this.tleService = tleService;
  }

  async doTleTask(_req, res) {
    const date = DateHandler.getCurrentUTCDate();
    console.log(date);
    await this.#tleScheduleHandler(date);
    return {};
  }

  /**
   * @param {Date} dateObj
   */
  async #tleScheduleHandler(dateObj) {
    if (this.excuting) {
      return;
    }
    console.log('tle scheduler start.');
    this.excuting = true;
    try {
      if (dateObj) {
        await this.tleService.deleteTles(dateObj);
      }
      const loginCookie = await SendRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URL}/${this.#AUTH_URL}`,
        process.env.SPACETRACK,
      );
      const tlePlainTexts = await SendRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URL}/${this.#QUERY_URL}`,
        loginCookie,
      );
      const newTlePlainTexts = await this.tleService.saveTlesOnDatabase(
        dateObj,
        tlePlainTexts,
      );
      await TleHandler.saveTlesOnFile(dateObj, newTlePlainTexts);
      console.log(`Save satellite TLE at : ${dateObj}`);
    } catch (err) {
      await SendEmailHandler.sendMail(
        'shawn.choi@spacemap42.com',
        '[SPACEMAP] tle task 에서 에러가 발생하였습니다.',
        err,
      );
    } finally {
      this.excuting = false;
      console.log('tle scheduler finish.');
    }
  }
}

module.exports = TleTask;
