/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const WatcherCatchersModel = require('./watcherCatchers.model');
const { default: mongoose } = require('mongoose');
const { Mutex } = require('async-mutex');
const Cesium = require('cesium');
const moment = require('moment');
const {
  CollisionAvoidancesModel,
  ColaTasksModel,
} = require('./collisionAvoidances.model');
const ColadbModel = require('./coladb.model');
const ColadbService = require('./coladb.service');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class CollisionAvoidancesService {
  /** @param { ColadbService } coladbService */
  constructor(coladbService) {
    this.coladbService = coladbService;
    this.mutex = new Mutex();
  }
}
module.exports = CollisionAvoidancesService;
