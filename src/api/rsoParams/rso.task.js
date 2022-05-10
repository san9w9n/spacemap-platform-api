/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars

const { promiseWriteFile } = require('../../lib/promise-io');
const SendRequestHandler = require('../../lib/sendRequest-handler');

class RsoParamsTask {
  #SPACETRACK_URL = 'https://www.space-track.org';

  #AUTH_URL = 'ajaxauth/login';

  #QUERY_URL =
    'basicspacedata/query/class/gp/orderby/NORAD_CAT_ID,EPOCH/format/xml';

  constructor() {
    this.name = 'RSO-PARAMS TASK';
    this.period = '* * * * * *';
    this.excuting = false;
    this.handler = this.#rsoScheduleHandler.bind(this);
  }

  /**
   * @param {Date} dateObj
   */
  async #rsoScheduleHandler(dateObj) {
    if (!this.excuting) {
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
        // console.log(rsoParamsPlainText);
        await promiseWriteFile(
          `./public/rsoParam/test.xml`,
          rsoParamsPlainText
        );
      } catch (err) {
        console.error(err);
      } finally {
        this.excuting = false;
        console.log('rso scheduler finish.');
      }
    }
  }
}

module.exports = RsoParamsTask;
