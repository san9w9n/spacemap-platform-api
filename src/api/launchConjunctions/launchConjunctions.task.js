/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const LaunchConjunctionsService = require('./launchConjunctions.service');
// eslint-disable-next-line no-unused-vars
const LpdbService = require('../lpdb/lpdb.service');
const LaunchConjunctionsHandler = require('../../lib/launchConjunction-handler');
const SshHandler = require('../../lib/ssh-handler');

class LaunchConjunctionTask {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  /**
   * @param { LaunchConjunctionsService } launchConjunctionsService
   * @param { LpdbService } lpdbService
   */
  constructor(launchConjunctionsService, lpdbService) {
    this.name = 'LCA TASK';
    this.period = '* * * * * *';
    this.excuting = false;
    this.launchConjunctionsService = launchConjunctionsService;
    this.lpdbService = lpdbService;
    this.handler = this.#launchConjunctionScheduleHandler.bind(this);
    this.sshHandler = new SshHandler();
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
      await LaunchConjunctionsHandler.sshExec(
        remoteInputFilePath,
        remoteOutputFilePath,
        threshold
      );
      await LaunchConjunctionsHandler.getFileFromRemoteServer(
        remoteOutputFilePath,
        localOutputPath
      );
      await this.lpdbService.saveLpdbOnDatabase(localOutputPath, taskId);
      await this.launchConjunctionsService.updateTaskStatusSuceess(
        taskId,
        localOutputPath
      );
      console.log(`Task ${taskId} has Successfully Done.`);
    } catch (err) {
      console.log(`Task ${taskId} has not done : ${err}`);
      await this.launchConjunctionsService.updateTaskStatusFailed(
        taskId,
        localOutputPath,
        err
      );
    }
  }

  async #launchConjunctionScheduleHandler() {
    if (this.excuting) {
      return;
    }
    this.excuting = true;
    const cpuUsagePercent = await this.sshHandler.execTop();
    if (cpuUsagePercent >= 700) {
      console.log(`cpuUsage: ${cpuUsagePercent}%`);
      this.excuting = false;
      return;
    }
    const task = await this.launchConjunctionsService.popTaskFromDb();
    if (!task) {
      this.excuting = false;
      return;
    }
    this.#taskStart(task);
    this.excuting = false;
  }
}

module.exports = LaunchConjunctionTask;
