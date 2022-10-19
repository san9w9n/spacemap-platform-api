/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

// eslint-disable-next-line no-unused-vars
const { query } = require('express');
const TleService = require('../tles/tle.service');
const PpdbModel = require('./ppdb.model');
const InterestedSatellitesService = require('../interestedSatellites/interestedSatellites.service');
const StringHandler = require('../../lib/string-handler');
const { BadRequestException } = require('../../common/exceptions');

class PpdbService {
  /**
   * @param { InterestedSatellitesService } interestedSatellitesService
   * @param { TleService } tleService
   */
  constructor(tleService, interestedSatellitesService) {
    this.tleService = tleService;
    this.interestedSatellitesService = interestedSatellitesService;
  }

  async clearPpdbDatabase() {
    return PpdbModel.deleteMany({}).exec();
  }

  async findConjunctions(limit, page, sort, satellite) {
    if (satellite) {
      const { conjunctions, totalcount } = await (StringHandler.isNumeric(
        satellite,
      )
        ? this.findConjunctionsByIdsService(limit, page, sort, [satellite])
        : this.findConjunctionsByNameService(limit, page, sort, satellite));
      return {
        totalcount,
        conjunctions,
      };
    }
    const { conjunctions, totalcount } = await this.findConjunctionsService(
      limit,
      page,
      sort,
    );
    return {
      totalcount,
      conjunctions,
    };
  }

  async findInterestedConjunctions(email, limit, page, sort, satellite) {
    const interestedSatellites =
      await this.interestedSatellitesService.readInterestedSatellites(email);
    let { interestedArray } = interestedSatellites;

    if (satellite) {
      if (StringHandler.isNumeric(satellite)) {
        interestedArray = interestedArray.filter(
          (s) => s.id == Number(satellite),
        );
      } else {
        interestedArray = interestedArray.filter((s) =>
          new RegExp(satellite, 'i').test(s.name),
        );
      }
    }
    const satellitesIds = interestedArray.map((s) => s.id);

    const { totalcount, conjunctions } =
      await this.findConjunctionsByIdsService(limit, page, sort, satellitesIds);
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsBySatIdsOnly(limit, page, sort, satellite) {
    if (!StringHandler.isNumeric(satellite)) {
      throw new BadRequestException('Search word must be a number.');
    }
    const { conjunctions, totalcount } =
      await this.findConjunctionsByIdsService(limit, page, sort, [satellite]);
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsService(limit, page, sort) {
    const queryOption = {
      // tcaTime: { $gte: new Date() },
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .sort(sort)
      .skip(limit * page)
      .limit(limit)
      .exec();
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsByIdsService(limit, page, sort, ids) {
    const queryOption = {
      $and: [
        { $or: [{ pid: { $in: ids } }, { sid: { $in: ids } }] },
        // { tcaTime: { $gte: new Date() } },
      ],
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .sort(sort)
      .skip(limit * page)
      .limit(limit)
      .exec();
    conjunctions.map((conjunction) => {
      if (ids.some((id) => id == conjunction.sid)) {
        [conjunction.pid, conjunction.sid] = [conjunction.sid, conjunction.pid];
        [conjunction.pName, conjunction.sName] = [
          conjunction.sName,
          conjunction.pName,
        ];
      }
    });
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsByNameService(limit, page, sort, name) {
    const queryOption = {
      $and: [
        {
          $or: [
            { pName: { $regex: name, $options: 'i' } },
            { sName: { $regex: name, $options: 'i' } },
          ],
        },
        // { tcaTime: { $gte: new Date() } },
      ],
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .sort(sort)
      .skip(limit * page)
      .limit(limit)
      .exec();
    conjunctions.map((conjunction) => {
      if (new RegExp(name, 'i').test(conjunction.sName)) {
        [conjunction.pid, conjunction.sid] = [conjunction.sid, conjunction.pid];
        [conjunction.pName, conjunction.sName] = [
          conjunction.sName,
          conjunction.pName,
        ];
      }
    });
    return {
      totalcount,
      conjunctions,
    };
  }
}

module.exports = PpdbService;
