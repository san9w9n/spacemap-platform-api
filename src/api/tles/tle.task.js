/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const fs = require('fs');
const request = require('request');
const { promisify } = require('util');
const { Cookie } = require('request-cookies');
const TleService = require('./tle.service');
const { isTleTableClearDay } = require('../../lib/date-handler');

const tleService = new TleService();
const requestPromise = promisify(request);
const writeFilePromise = promisify(fs.writeFile);

const SPACETRACK_URL = 'https://www.space-track.org';
const AUTH_URL = 'ajaxauth/login';
const QUERY_URL =
  'basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le';

class TleTask {
  constructor() {
    this.name = 'TLE TASK';
    this.period = '0 0 0 * * *';
    this.handler = this.#tleScheduleHandler.bind(this);
  }

  /**
   * @param {String} date
   */
  async #tleScheduleHandler(date) {
    try {
      if (isTleTableClearDay()) {
        await tleService.deleteTles();
      }
      const loginCookie = await this.#getLoginCookieFromSpaceTrack();
      const tles = await this.#getTlesFromSpaceTrack(loginCookie);
      await this.#saveTlesOnFile(date, tles);
      await tleService.saveTlesOnDatabase(date, tles);
      console.log(`Save satellite TLE at : ${date}`);
    } catch (err) {
      console.error(err);
    }
  }

  async #getLoginCookieFromSpaceTrack() {
    const res = await requestPromise({
      url: `${SPACETRACK_URL}/${AUTH_URL}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: process.env.SPACETRACK,
    });
    const rawCookies = res.headers['set-cookie'];
    if (!rawCookies) {
      throw new Error('Space track login failed.');
    }
    const parsedCookies = await Promise.all(
      rawCookies.map((rawCookie) => {
        const parsedCookie = new Cookie(rawCookie);
        return `${parsedCookie.key}=${parsedCookie.value}`;
      })
    );
    const cookie = parsedCookies.join('; ');
    return cookie;
  }

  async #getTlesFromSpaceTrack(loginCookie) {
    const headers = {
      Cookie: loginCookie,
    };
    const res = await requestPromise({
      url: `${SPACETRACK_URL}/${QUERY_URL}`,
      headers,
    });
    if (res.statusCode !== 200) {
      throw new Error('Response status code is not 200. (spacetrack)');
    }
    return res.body;
  }

  async #saveTlesOnFile(date, tles) {
    return writeFilePromise(`./public/tle/${date}.tle`, tles);
  }
}

module.exports = TleTask;
