/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const DateHandler = require('../../lib/date-handler');
const CollisionAvoidancesService = require('./collisionAvoidances.service');
const {
  BadRequestException,
  ForbiddenException,
} = require('../../common/exceptions');
const { verifyUser } = require('../../middlewares/auth.middleware');

class CollisionAvoidancesController {
  /** @param { CollisionAvoidancesService } collisionAvoidancesService */
  constructor(collisionAvoidancesService) {
    this.collisionAvoidancesService = collisionAvoidancesService;
    this.path = '/collision-avoidances';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readCollisionAvoidances.bind(this)))
      .get('/:dbId', wrapper(this.findCollisionAvoidances.bind(this)))
      .delete('/:dbId', wrapper(this.deleteCollisionAvoidances.bind(this)))
      .post('/', wrapper(this.predictCollisionAvoidances.bind(this)));
  }

  async readCollisionAvoidances(req, _res) {
    const { email } = req.user;
    const data = await this.collisionAvoidancesService.readCollisionAvoidances(
      email,
    );
    return { data };
  }

  async findCollisionAvoidances(req, _res) {
    const { email } = req.user;
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Param is empty.');
    }
    const data = await this.collisionAvoidancesService.findCollisionAvoidances(
      dbId,
    );
    return { data };
  }

  async deleteCollisionAvoidances(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Wrong param.');
    }
    const data =
      await this.collisionAvoidancesService.deleteCollisionAvoidances(dbId);
    return { data };
  }

  async predictCollisionAvoidances(req, _res) {
    if (!DateHandler.isCalculatableDate()) {
      throw new ForbiddenException('Not available time.');
    }
    const { email } = req.user;

    const startMomentOfPredictionWindow =
      await DateHandler.getStartMomentOfPredictionWindow();

    const threshold = 50; // km
    const { longitude, latitude, altitude, fieldOfView, epochTime, endTime } =
      req.body;

    const taskId = await this.collisionAvoidancesService.enqueTask(
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

module.exports = CollisionAvoidancesController;
