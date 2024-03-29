/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const SendEmailHandler = require('../../lib/node-mailer');
const InterestedSatellitesService = require('../interestedSatellites/interestedSatellites.service');
const moment = require('moment');
const {
  exists,
} = require('../interestedSatellites/interestedSatellites.model');

class LogTask {
  /**
   * @param { LogService } logService
   * @param { InterestedSatellitesService} interestedSatellitesService
   */
  constructor(logService, interestedSatellitesService) {
    this.name = 'LOG TASK';
    this.period = '0 0 0 * * *';
    this.logService = logService;
    this.interestedSatellitesService = interestedSatellitesService;
    this.handler = this.#logAndSendEmail.bind(this);
  }

  async renderLogReport(req, res) {
    const context = await this.#makeContext();
    const html = await SendEmailHandler.renderHtml('logReport', context);
    return res.send(html);
  }

  async doLogTask(_req, res) {
    await this.#sendLog();
    return {};
  }

  async #logAndSendEmail() {
    await this.#logNumUsers();
    await this.#sendLog();
  }

  async #logNumUsers() {
    await this.logService.logNumUsers();
  }

  async #sendLog() {
    const context = await this.#makeContext();
    const title = `Log Report (${moment.utc().format('MMM DD')})`;
    const html = await SendEmailHandler.renderHtml('logReport', context);
    await SendEmailHandler.sendMail(
      [
        'shawn.choi@spacemap42.com',
        'douglas.kim@spacemap42.com',
        'dskim.hanyang@gmail.com',
        'peter.ryu@spacemap42.com',
        '2018008168@hanyang.ac.kr',
        'sjb990221@gmail.com',
      ],
      title,
      html,
    );
  }

  async #makeContext() {
    const { yesterdayNumUsers, todayNumUsers } =
      await this.logService.getNumUsers();

    const change = todayNumUsers - yesterdayNumUsers;
    const changeString = (change < 0 ? '' : '+') + String(change);

    const users = await this.logService.getAllUsers();
    const usersInfo = await Promise.all(
      users.map(async (user) => {
        const favorite =
          await this.interestedSatellitesService.readInterestedSatellites(
            user.email,
          );
        const { interestedArray, subscribe } = favorite;
        interestedArray.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        const interestedSatellitesString = interestedArray.length;
        const subscribeString = subscribe ? 'O' : '';
        const lastVisitString = user.lastVisit
          ? moment.utc(user.lastVisit).fromNow()
          : '';
        return {
          email: user.email,
          nickname: user.nickname,
          interestedSatellites: interestedSatellitesString,
          subscribe: subscribeString,
          lastVisit: lastVisitString,
        };
      }),
    );
    return {
      yesterdayNumUsers,
      todayNumUsers,
      changeString,
      usersInfo,
    };
  }
}

module.exports = LogTask;
