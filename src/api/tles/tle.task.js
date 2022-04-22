/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const request = require('request');
const fs = require('fs');
const { Cookie } = require('request-cookies');
const { promisify } = require('util');
const { getStringFormatData } = require('../../lib/date-formatter');
const TleService = require('./tle.service');

const requestPromise = promisify(request);
const writeFilePromise = promisify(fs.writeFile);
const tleService = new TleService();

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

  async #tleScheduleHandler() {
    const dateObj = new Date();
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const hours = dateObj.getUTCHours();
    const date = getStringFormatData(year, month, day, hours);

    try {
      if (day === 0 && hours === 0) {
        await tleService.deleteTles();
      }
      const loginCookie = await this.#getLoginCookieFromSpaceTrack();
      const tles = await this.#getTlesFromSpaceTrack(loginCookie);
      await this.#saveTlesOnFile(date, tles, 0);
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

  async #saveTlesOnFile(date, tles, errorCount) {
    if (errorCount === 5) {
      throw new Error('FATAL: Cannot save TLE file.');
    }
    try {
      await writeFilePromise(`./public/tle/${date}.tle`, tles);
      console.log('TLE file is successfully saved.');
    } catch (err) {
      console.error(err);
      await this.saveTlesOnFile(date, tles, errorCount + 1);
    }
  }
}

module.exports = TleTask;
