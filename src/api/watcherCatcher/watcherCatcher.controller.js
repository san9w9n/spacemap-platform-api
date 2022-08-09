/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const DateHandler = require('../../lib/date-handler');
const WatcherCatcherService = require('./watcherCatcher.service');
const upload = require('../../lib/file-upload');
const {
  BadRequestException,
  ForbiddenException,
} = require('../../common/exceptions');
const { verifyUser } = require('../../middlewares/auth.middleware');

class WatcherCatcherController {
  /** @param { WatcherCatcherService } watcherCatcherService */
  constructor(watcherCatcherService) {
    this.watcherCatcherService = watcherCatcherService;
    this.path = '/watcher-catchers';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readWatcherCatcher.bind(this)))
      .get('/:dbId', wrapper(this.findWatcherCatcher.bind(this)))
      .delete('/:dbId', wrapper(this.deleteWatcherCatcher.bind(this)))
      .post('/', wrapper(this.predictWatcherCatcher.bind(this)));
  }

  async readWatcherCatcher(req, _res) {
    const { email } = req.user;
    const data = await this.watcherCatcherService.readWatcherCatcher(email);
    return { data };
  }

  async findWatcherCatcher(req, _res) {
    const { email } = req.user;
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Param is empty.');
    }
    const data = await this.watcherCatcherService.findWatcherCatcher(dbId);
    return { data };
  }

  async deleteWatcherCatcher(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Wrong param.');
    }
    const data = await this.watcherCatcherService.deleteWatcherCatcher(dbId);
    return { data };
  }

  async predictWatcherCatcher(req, _res) {
    if (!DateHandler.isCalculatableDate()) {
      throw new ForbiddenException(
        'Not available time.\r\n(Unable time: UTC 15:00 ~ 21:00)',
      );
    }
    const { email } = req.user;
    const startMomentOfPredictionWindow =
      await DateHandler.getStartMomentOfPredictionWindow();

    const threshold = 50; // km
    const { longitude, latitude, altitude, fieldOfView, epochTime, endTime } =
      req.body;

    if (
      !(await DateHandler.isBetweenPredictionWindow(epochTime, endTime)) ||
      !DateHandler.isDateInCorrectOrder(epochTime, endTime)
    ) {
      const errorMessage = await DateHandler.getTimeErrorMessage();
      throw new BadRequestException(errorMessage);
    }

    const taskId = await this.watcherCatcherService.enqueTask(
      email,
      Number(latitude),
      Number(longitude),
      altitude,
      fieldOfView,
      epochTime,
      endTime,
      startMomentOfPredictionWindow,
      threshold,
    );

    return {
      message: 'Request success.',
      data: {
        taskId,
      },
    };
  }
}

module.exports = WatcherCatcherController;
