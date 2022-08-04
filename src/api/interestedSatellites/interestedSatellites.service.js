/* eslint-disable class-methods-use-this */
const InterestedSatellitesModel = require('./interestedSatellites.model');
const TleModel = require('../tles/tle.model');
const { BadRequestException } = require('../../common/exceptions');

class InterestedSatellitesService {
  async readInterestedSatellites(email) {
    const interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    }).exec();
    if (!interestedSatellites) {
      const newInterestedSatellite = {
        email,
        interestedArray: [],
      };
      await InterestedSatellitesModel.create(newInterestedSatellite);
      return newInterestedSatellite;
    }
    return interestedSatellites;
  }

  async findSatellitesByIdService(email, satelliteId) {
    let interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    }).exec();
    if (!interestedSatellites) {
      interestedSatellites = {
        email,
        interestedArray: [],
      };
      await InterestedSatellitesModel.create(interestedSatellites);
    }
    const { interestedArray } = interestedSatellites;
    const searchedSatellitesWithInterested = interestedArray
      .filter((interesterItem) => {
        return interesterItem.id === satelliteId;
      })
      .map((interestedItem) => {
        const { id, name } = interestedItem;
        return {
          id,
          name,
          isInterested: true,
        };
      });
    if (searchedSatellitesWithInterested.length === 0) {
      const searchedSatellite = await TleModel.findOne({
        id: satelliteId,
      }).exec();
      if (searchedSatellite) {
        const { id, name } = searchedSatellite;
        searchedSatellitesWithInterested.push({
          id,
          name,
          isInterested: false,
        });
      }
    }
    return searchedSatellitesWithInterested;
  }

  async findSatellitesByNameService(email, satelliteName) {
    let interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    }).exec();
    if (!interestedSatellites) {
      interestedSatellites = {
        email,
        interestedArray: [],
      };
      await InterestedSatellitesModel.create(interestedSatellites);
    }
    const { interestedArray } = interestedSatellites;

    const tleModel = await TleModel.findOne({ id: 11 }).exec();
    if (!tleModel) {
      throw new Error('Something is wrong. (at getIdNamePairs)');
    }
    const { date } = tleModel;

    const queryOption = {
      $and: [{ date }, { name: { $regex: satelliteName, $options: 'i' } }],
    };
    const searchedArray = await TleModel.find(queryOption).exec();
    const searchedSatellitesWithInterested = searchedArray.map(
      (searchedElement) => {
        const { id, name } = searchedElement;
        const interestedLength = interestedArray.length;
        let flag = false;
        for (let i = 0; i < interestedLength; i += 1) {
          if (interestedArray[i].id === String(id)) {
            flag = true;
            break;
          }
        }
        return {
          id,
          name,
          isInterested: flag,
        };
      },
    );

    return searchedSatellitesWithInterested;
  }

  async createOrUpdateInterestedSatelliteId(email, interestedSatelliteId) {
    const interestedSatellite = await InterestedSatellitesModel.findOne({
      email,
    }).exec();
    const searchedSatellites = await TleModel.findOne({
      id: interestedSatelliteId,
    });
    if (!searchedSatellites) {
      throw new BadRequestException(`There is not ${interestedSatelliteId}`);
    }
    const { id, name } = searchedSatellites;
    if (interestedSatellite) {
      const { interestedArray } = interestedSatellite;
      const interestedLength = interestedArray.length;
      for (let i = 0; i < interestedLength; i += 1) {
        if (interestedArray[i].id === interestedSatelliteId) {
          return {
            email,
            interestedArray,
          };
        }
      }
      interestedArray.push({ id, name });
      await InterestedSatellitesModel.findOneAndUpdate(
        { email },
        { interestedArray },
      ).exec();
      return {
        email,
        interestedArray,
      };
    }

    const newInterestedSatellites = {
      email,
      interestedArray: [
        {
          id,
          name,
        },
      ],
    };
    await InterestedSatellitesModel.create(newInterestedSatellites);
    return newInterestedSatellites;
  }

  async deleteInterestedSatelliteId(email, interestedSatelliteId) {
    const interestedSatellite = await InterestedSatellitesModel.findOne({
      email,
    }).exec();
    const { interestedArray } = interestedSatellite;
    const index = interestedArray.findIndex((object) => {
      return object.id === interestedSatelliteId;
    });
    if (index >= 0) {
      interestedArray.splice(index, 1);
      await InterestedSatellitesModel.findOneAndUpdate(
        {
          email,
        },
        { interestedArray },
      ).exec();
    }
    return {
      email,
      interestedArray,
    };
  }

  async readSubscribingUsers() {
    return InterestedSatellitesModel.find({
      // subscribe: true,
      email: 'zztnrudzz123433@gmail.com',
    });
  }

  async updateSubscribe(email, subscribe) {
    await InterestedSatellitesModel.findOneAndUpdate(
      { email },
      { subscribe },
    ).exec();
    return {
      email,
      subscribe,
    };
  }
}

module.exports = InterestedSatellitesService;
