/* eslint-disable no-console */

const cron = require('node-cron');

class CronScheduler {
  /**
   * @param {[Object]} taskObjs
   */
  constructor(taskObjs) {
    this.taskSchedulers = taskObjs.map((taskObj) => {
      const { period, handler } = taskObj;
      return cron.schedule(period, handler, {
        scheduled: false,
      });
    });
  }

  startAllScheduler() {
    this.taskSchedulers.forEach((taskObj) => {
      taskObj.start();
    });
  }
}

module.exports = CronScheduler;
