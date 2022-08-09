/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const UserModel = require('../oauth/user/user.model');
const LogModel = require('./log.model');
const { BadRequestException } = require('../../common/exceptions');
const moment = require('moment');

class LogService {
  async logNumUsers() {
    const numUsers = await UserModel.countDocuments();
    await LogModel.create({
      numUsers,
    });
  }

  async logLastVisit(email) {
    await UserModel.findOneAndUpdate({ email }, { lastVisit: moment.utc() });
  }

  async getNumUsers() {
    const today = moment.utc().startOf('day');
    const yesterday = moment.utc().subtract(1, 'day').startOf('day');
    const todayLog = await LogModel.findOne({
      createdAt: {
        $gte: today.toDate(),
        $lte: moment(today).endOf('day').toDate(),
      },
    });
    const yesterdayLog = await LogModel.findOne({
      createdAt: {
        $gte: yesterday.toDate(),
        $lte: moment(yesterday).endOf('day').toDate(),
      },
    });
    return {
      yesterdayNumUsers: yesterdayLog?.numUsers || 0,
      todayNumUsers: todayLog?.numUsers || 0,
    };
  }

  async getAllUsers() {
    return UserModel.find();
  }
}

module.exports = LogService;
