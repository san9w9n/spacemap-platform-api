/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const moment = require('moment');
const InterestedSatellitesService = require('./interestedSatellites.service');
const PpdbService = require('../ppdbs/ppdb.service');
const SendEmailHandler = require('../../lib/node-mailer');
const InterestedSatellitesMailing = require('./interestedSatellites.mailing');

class InterestedSatellitesTask {
  /**
   * @param { InterestedSatellitesService } interestedSatellitesService
   * @param { PpdbService } ppdbService
   */
  constructor(interestedSatellitesService, ppdbService) {
    this.name = 'IS TASK';
    this.period = '0 0 0 * * *';
    this.interestedSatellitesService = interestedSatellitesService;
    this.ppdbService = ppdbService;
    this.handler = this.#sendInterestedConjunctions.bind(this);
  }

  async renderSpaceEventReport(_req, res) {
    const { interestedArray } =
      await this.interestedSatellitesService.readInterestedSatellites(
        'qudwo09@gmail.com',
        // 'sjb990221@gmail.com',
        // '2018008168@hanyang.ac.kr',
      );
    const { context } = await this.#makeContextAttachment(interestedArray);
    const html = await SendEmailHandler.renderHtml('spaceEventReport', context);
    return res.send(html);
  }

  async doInterestedSatellitesTask() {
    await this.#sendInterestedConjunctions();
    return {};
  }

  async #sendInterestedConjunctions() {
    const users = await this.interestedSatellitesService.readSubscribingUsers();
    await Promise.all(
      users.map(async (user) => {
        const { email, interestedArray } = user;
        if (interestedArray.length == 0) return;
        const { context, attachments } = await this.#makeContextAttachment(
          interestedArray,
        );
        const title = `Space Event Report (${moment.utc().format('MMM DD')})`;
        const html = await SendEmailHandler.renderHtml(
          'spaceEventReport',
          context,
        );
        await SendEmailHandler.sendMail(email, title, html, attachments);
      }),
    );
  }

  async #makeContextAttachment(interestedArray) {
    const satellitesIds = interestedArray.map((satellite) => satellite.id);
    const { totalcount, conjunctions } =
      await this.ppdbService.findConjunctionsByIdsService(
        10,
        0,
        'dca',
        satellitesIds,
      );
    const newConjunctions = conjunctions.map((conjunction, index) => {
      return {
        index: index + 1,
        pId: conjunction.pId,
        pName: conjunction.pName,
        sId: conjunction.sId,
        sName: conjunction.sName,
        tcaTime: moment
          .utc(conjunction.tcaTime)
          .format('MMM DD, YYYY HH:mm:ss'),
        dca: conjunction.dca,
      };
    });
    const conjunctionsForCsv = await Promise.all(
      satellitesIds.map(async (satelliteId) =>
        this.ppdbService.findConjunctionsByIdsService(0, 0, 'tcaTime', [
          satelliteId,
        ]),
      ),
    );
    // conjunctionsForCsv.sort((a, b) => b.totalcount - a.totalcount);
    const metadata = interestedArray.map((object, index) => {
      return {
        id: object.id,
        name: object.name,
        numConjunctions: conjunctionsForCsv[index].totalcount,
      };
    });
    const context = {
      reportDate: moment.utc().format('MMM DD, yyyy'),
      conjunctions: newConjunctions,
      totalcount: totalcount,
      metadata: metadata,
    };
    const attachments =
      await InterestedSatellitesMailing.conjunctionsToAttachment(
        conjunctionsForCsv,
        metadata,
      );
    return {
      context,
      attachments,
    };
  }
}

module.exports = InterestedSatellitesTask;
