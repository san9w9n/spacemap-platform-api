/* eslint-disable no-console */

const request = require('request');
const { Cookie } = require('request-cookies');
const { promisify } = require('util');
const fs = require('fs');

const requestPromise = promisify(request);
const fileWritePrimise = promisify(fs.writeFile);

const getLoginCookie = async () => {
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

const getTleTexts = async (date) => {
  const cookie = await getLoginCookie();
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

  await fileWritePrimise(`./public/tle/${date}.tle`, res.body);
  return res.body;
};

module.exports = getTleTexts;
