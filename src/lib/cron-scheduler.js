/* eslint-disable no-console */

const cron = require('node-cron');
const { getCurrentFormatDate } = require('./date-handler');

class CronScheduler {
  /**
   * @param {[Object]} taskObjs
   */
  constructor(taskObjs) {
    this.taskSchedulers = taskObjs.map((taskObj) => {
      const { period, handler } = taskObj;
      return cron.schedule(
        period,
        async () => {
          await handler(getCurrentFormatDate());
        },
        {
          scheduled: false,
        }
      );
    });
  }

  startAllSchedule() {
    this.taskSchedulers.forEach((taskObj) => {
      taskObj.start();
    });
  }
}

module.exports = CronScheduler;
