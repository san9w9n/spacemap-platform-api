/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const moment = require('moment');
const InterestedSatellitesService = require('./interestedSatellites.service');
const SendEmailHandler = require('../../lib/node-mailer');
const InterestedSatellitesHandler = require('../../lib/interestedSatellites-handler');

class InterestedSatellitesTask {
  /**
   * @param { InterestedSatellitesService } InterestedSatellitesService
   */
  constructor(interestedSatellitesService) {
    this.name = 'IS TASK';
    this.period = '0 0 0 * * *';
    this.interestedSatellitesService = interestedSatellitesService;
    this.handler = this.#sendInterestedConjunctions.bind(this);
    /* Debugging */
    // this.#sendInterestedConjunctions();
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
          InterestedSatellitesHandler.conjunctionsToHtml(conjunctions),
        );
      }),
    );
  }
}

module.exports = InterestedSatellitesTask;

/* ISSUES
 * interested가 Primary로   ->InterestedSatellitesService.sortConjunctionBySatellitesIds()
 * csv
 * metadata
 * table more (toggle)
 * table 분할?
 */
