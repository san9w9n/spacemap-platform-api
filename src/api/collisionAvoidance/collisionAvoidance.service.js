/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const { default: mongoose } = require('mongoose');
const { Mutex } = require('async-mutex');
const Cesium = require('cesium');
const moment = require('moment');
const {
  CollisionAvoidanceModel,
  ColaTaskModel,
} = require('./collisionAvoidance.model');
const ColadbModel = require('./coladb.model');
const ColadbService = require('./coladb.service');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class CollisionAvoidanceService {
  /** @param { ColadbService } coladbService */
  constructor(coladbService) {
    this.coladbService = coladbService;
    this.mutex = new Mutex();
  }
}
module.exports = CollisionAvoidanceService;
