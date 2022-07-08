/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const moment = require('moment');
const InterestedSatellitesService = require('./interestedSatellites.service');
const SendEmailHandler = require('../../lib/node-mailer');
const HtmlHandler = require('../../lib/html-handler');

class InterestedSatellitesTask {
  /**
   * @param { InterestedSatellitesService } InterestedSatellitesService
   */
  constructor(interestedSatellitesService) {
    this.name = 'IS TASK';
    // this.period = '*/10 * * * * *';
    this.period = '0 0 0 * * *';
    this.interestedSatellitesService = interestedSatellitesService;
    this.handler = this.#sendInterestedConjunctions.bind(this);
  }

  async #sendInterestedConjunctions() {
    const users = await this.interestedSatellitesService.getSubscribingUsers();
    Promise.all(
      users.map(async (user) => {
        const { email, interestedArray } = user;
        const satellitesIds = interestedArray.map((satellite) => {
          return satellite.id;
        });
        const conjunctions =
          await this.interestedSatellitesService.getConjunctionsBySatellitesIds(
            satellitesIds,
          );
        await SendEmailHandler.sendMail(
          email,
          `[SPACEMAP] Daily Conjunctions Report : ${moment
            .utc()
            .format('MMM DD')}`,
          HtmlHandler.jsonToHtml(conjunctions),
        );
      }),
    );
  }
}

module.exports = InterestedSatellitesTask;

/* ISSUES
 * prettier             -> 완
 * Promise.all          ->
 * period : utc 00:00   -> 완
 * html                 -> 완
 * sort: tca            -> 완
 * 메일 제목            -> 완
 * subscribe rerquired  -> 완
 * subscribe api        -> 완
 * 스케줄러 commit      -> 완
 * 발신인
 * user email foriegn   -> foriegn
 */
