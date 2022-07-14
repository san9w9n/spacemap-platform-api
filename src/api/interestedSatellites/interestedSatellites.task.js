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
  }

  async #sendInterestedConjunctions() {
    const users = await this.interestedSatellitesService.getSubscribingUsers();
    await Promise.all(
      users.map(async (user) => {
        const { email, interestedArray } = user;
        if (interestedArray.length == 0) return;
        const satellitesIds = interestedArray.map((satellite) => satellite.id);
        const conjunctionsByDca =
          await this.interestedSatellitesService.getConjunctionsByDca(
            satellitesIds,
          );
        const conjunctionsBySatellitesIds =
          await this.interestedSatellitesService.getConjunctionsBySatellitesIds(
            satellitesIds,
          );
        const metadata = this.interestedSatellitesService.getMetadata(
          conjunctionsBySatellitesIds,
        );

        await SendEmailHandler.sendMail(
          email,
          `[SPACEMAP] Daily Conjunctions Report : ${moment
            .utc()
            .format('MMM DD')}`,
          InterestedSatellitesHandler.conjunctionsToHtml(
            conjunctionsByDca,
            metadata,
          ),
          await InterestedSatellitesHandler.conjunctionsToAttachment(
            conjunctionsBySatellitesIds,
            email,
          ),
        );
      }),
    );

    InterestedSatellitesHandler.removeAllZips();
  }
}

module.exports = InterestedSatellitesTask;

/* ISSUES
 * platform primary 정렬
 * forEach, map ??
 * insertMany가 바로 적용 안되는 현상?
 * conjunctions[i][0]이 없는 경우 있을까?
 * public/zips
 * .exec()
 * gitignore, package.json 수정됐음
 * subscrive는 왜 __v 밑에?
 */
