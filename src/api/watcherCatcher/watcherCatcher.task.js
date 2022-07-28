/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const { Mutex } = require('async-mutex');
// eslint-disable-next-line no-unused-vars
const WatcherCatcherService = require('./watcherCatcher.service');
// eslint-disable-next-line no-unused-vars
const WcdbService = require('../wcdb/wcdb.service');
const WatcherCatcherLib = require('./watcherCatcher.lib');
const SshHandler = require('../../lib/ssh-handler');

class WatcherCatcherTask {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  /**
   * @param { WatcherCatcherService } watcherCatcherService
   * @param { WcdbService } wcdbService
   */
  constructor(watcherCatcherService, wcdbService) {
    this.name = 'WC TASK';
    this.period = '*/30 * * * * *';
    this.watcherCatcherService = watcherCatcherService;
    this.wcdbService = wcdbService;
    this.handler = this.#watcherCatcherScheduleHandler.bind(this);
    this.sshHandler = new SshHandler();
    this.mutex = new Mutex();
  }

  async #taskStart(task) {
    const {
      taskId,
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold,
      localOutputPath,
    } = task;
    console.log(`Task ${taskId} Start!`);
    try {
      await WatcherCatcherLib.sshExec(
        remoteInputFilePath,
        remoteOutputFilePath,
        threshold,
      );
      await WatcherCatcherLib.getFileFromRemoteServer(
        remoteOutputFilePath,
        localOutputPath,
      );
      await this.wcdbService.saveWcdbOnDatabase(localOutputPath, taskId);
      await this.watcherCatcherService.updateTaskStatusSuceess(
        taskId,
        localOutputPath,
      );
      console.log(`Task ${taskId} has Successfully Done.`);
    } catch (err) {
      console.log(`Task ${taskId} has not done : ${err}`);
      await this.watcherCatcherService.updateTaskStatusFailed(
        taskId,
        localOutputPath,
        err,
      );
    }
  }

  async #watcherCatcherScheduleHandler() {
    await this.mutex.runExclusive(async () => {
      const cpuUsagePercent = await this.sshHandler.execTop();
      if (cpuUsagePercent >= 700) {
        console.log(`cpuUsage: ${cpuUsagePercent}%`);
        return;
      }
      const task = await this.watcherCatcherService.popTaskFromDb();
      if (!task) {
        return;
      }
      await this.#taskStart(task);
    });
  }
}

module.exports = WatcherCatcherTask;
