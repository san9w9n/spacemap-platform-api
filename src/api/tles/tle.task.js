/* eslint-disable no-console */

const request = require('request');
const fs = require('fs');
const cron = require('node-cron');
const { Cookie } = require('request-cookies');
const { promisify } = require('util');
const { getStringFormatData } = require('../../lib/date-formatter');
const TleService = require('./tle.service');

const requestPromise = promisify(request);
const writeFilePromise = promisify(fs.writeFile);
const tleService = new TleService();

const getLoginCookieFromSpaceTrack = async () => {
  const res = await requestPromise({
    url: 'https://www.space-track.org/ajaxauth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: process.env.SPACETRACK,
  });
  const cookies = res.headers['set-cookie'];
  if (!cookies) {
    throw new Error('Space track login failed.');
  }
  const cookieArray = await Promise.all(
    cookies.map((cook) => {
      const cookie = new Cookie(cook);
      return `${cookie.key}=${cookie.value}`;
    })
  );
  return cookieArray.join('; ');
};

const getTleFileFromSpaceTrack = async (date) => {
  const cookie = await getLoginCookieFromSpaceTrack();
  const res = await requestPromise({
    url: 'https://www.space-track.org/basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le',
    headers: {
      Cookie: cookie,
    },
  });
  if (res.statusCode !== 200) {
    throw new Error('Response status code is not 200. (spacetrack)');
  }
  if (!res.body) {
    throw new Error('Response body is undefined. (spacetrack)');
  }
  writeFilePromise(`./public/tle/${date}.tle`, res.body);
  return res.body;
};

const tleTask = cron.schedule(
  '0 0 0 * * *',
  async () => {
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
      const tleFile = await getTleFileFromSpaceTrack(date);
      await tleService.saveTlesOnDatabase(date, tleFile);
      console.log(`Save satellite TLE at : ${date}`);
    } catch (err) {
      console.error(err);
    }
  },
  {
    scheduled: false,
  }
);

module.exports = tleTask;
