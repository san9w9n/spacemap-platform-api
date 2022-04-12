/* eslint-disable no-console */

const cron = require('node-cron');
const { createTles, deleteAllTles } = require('./tle.repository');
const getTleTexts = require('./tle.request');

const tleTask = cron.schedule(
  '0 0 0 * * *',
  async () => {
    const dateObj = new Date();
    const year = dateObj.getUTCFullYear();
    const month = `0${dateObj.getUTCMonth()}`.slice(-2);
    const day = `0${dateObj.getUTCDate()}`.slice(-2);
    const hours = `0${dateObj.getUTCHours()}`.slice(-2);
    const date = `${year}-${month}-${day}-${hours}`;

    try {
      if (dateObj.getUTCDay === 0 && dateObj.getUTCHour === 0) {
        await deleteAllTles();
      }
      await createTles(date, await getTleTexts(date));
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
