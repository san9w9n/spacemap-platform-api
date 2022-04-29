/* eslint-disable no-console */

const cron = require('node-cron');
const DateHandler = require('./date-handler');

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
          await handler(DateHandler.getCurrentFormatDate());
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
