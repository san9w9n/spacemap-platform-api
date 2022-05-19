/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const TleService = require('./tle.service');
const DateHandler = require('../../lib/date-handler');
const SendRequestHandler = require('../../lib/sendRequest-handler');
const TleHandler = require('../../lib/tle-handler');

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
      if (DateHandler.isTleDatabaseCleanDay()) {
        await this.tleService.deleteTles();
      }
      const loginCookie = await SendRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URL}/${this.#AUTH_URL}`,
        process.env.SPACETRACK
      );
      const tlePlainTexts = await SendRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URL}/${this.#QUERY_URL}`,
        loginCookie
      );
      await TleHandler.saveTlesOnFile(dateObj, tlePlainTexts);
      await this.tleService.saveTlesOnDatabase(dateObj, tlePlainTexts);
      console.log(`Save satellite TLE at : ${dateObj}`);
    } catch (err) {
      console.error(err);
    } finally {
      this.excuting = false;
      console.log('tle scheduler finish.');
    }
  }
}

module.exports = TleTask;
