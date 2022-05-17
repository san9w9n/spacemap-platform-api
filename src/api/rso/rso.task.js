/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const RsoService = require('./rso.service');
const RsoHandler = require('../../lib/rso-handler');
const SendRequestHandler = require('../../lib/sendRequest-handler');

class RsoParamsTask {
  #SPACETRACK_URL = 'https://www.space-track.org';

  #AUTH_URL = 'ajaxauth/login';

  #QUERY_URL =
    'basicspacedata/query/class/gp/orderby/NORAD_CAT_ID,EPOCH/format/xml';

  /** @param {RsoService} rsoService */
  constructor(rsoService) {
    this.name = 'RSO-PARAMS TASK';
    this.period = '0 0 3 * * *';
    this.excuting = false;
    this.rsoService = rsoService;
    this.handler = this.#rsoScheduleHandler.bind(this);
  }

  /**
   * @param {Date} dateObj
   */
  async #rsoScheduleHandler(dateObj) {
    if (this.excuting) {
      return;
    }
    console.log('rso scheduler start.');
    this.excuting = true;
    try {
      const loginCookie = await SendRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URL}/${this.#AUTH_URL}`,
        process.env.SPACETRACK
      );
      const rsoParamsPlainText = await SendRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URL}/${this.#QUERY_URL}`,
        loginCookie
      );
      const rsoJson = RsoHandler.parseRsoXml(rsoParamsPlainText);
      const rsoParamsArray = RsoHandler.getRsoParamArrays(rsoJson);
      await this.rsoService.updateRsoParams(rsoParamsArray);
      console.log(`Rso params updated at ${dateObj}`);
    } catch (err) {
      console.error(err);
    } finally {
      this.excuting = false;
      console.log('rso scheduler finish.');
    }
  }
}

module.exports = RsoParamsTask;
