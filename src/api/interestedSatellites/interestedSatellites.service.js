/* eslint-disable class-methods-use-this */
const InterestedSatellitesModel = require('./interestedSatellites.model');
const TleModel = require('../tles/tle.model');
const PpdbModel = require('../ppdbs/ppdb.model');

class InterestedSatellitesService {
  async readInterestedSatellites(email) {
    const interestedSatellites = InterestedSatellitesModel.findOne({ email });
    return interestedSatellites;
  }

  async findSatellitesByIdService(email, satelliteId) {
    const interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    });
    const searchedSatellites = await TleModel.find({ id: satelliteId });
    const searchedSatellitesWithInterested = [];
    searchedSatellites.forEach(async (searchedSatellite) => {
      if (interestedSatellites === null) {
        searchedSatellitesWithInterested.push({
          id: searchedSatellite.id,
          name: searchedSatellite.name,
          isInterested: false,
        });
      } else {
        const isInterested = await this.isMyInterestedSatellites(
          searchedSatellite.id,
          interestedSatellites
        );
        searchedSatellitesWithInterested.push({
          id: searchedSatellite.id,
          name: searchedSatellite.name,
          isInterested,
        });
      }
    });
    return searchedSatellitesWithInterested;
  }

  async findSatellitesByNameService(email, satelliteName) {
    const interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    });
    const queryOption = {
      name: { $regex: satelliteName, $options: 'i' },
    };
    const searchedSatellites = await TleModel.find(queryOption);
    const searchedSatellitesWithInterested = [];
    searchedSatellites.forEach(async (searchedSatellite) => {
      if (interestedSatellites === null) {
        searchedSatellitesWithInterested.push({
          id: searchedSatellite.id,
          name: searchedSatellite.name,
          isInterested: false,
        });
      } else {
        const isInterested = await this.isMyInterestedSatellites(
          searchedSatellite.id,
          interestedSatellites
        );
        searchedSatellitesWithInterested.push({
          id: searchedSatellite.id,
          name: searchedSatellite.name,
          isInterested,
        });
      }
    });
    return searchedSatellitesWithInterested;
  }

  async readInterestedConjunctions(email) {
    const interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    });
    const queryOption = {
      $or: [
        { pid: { $in: interestedSatellites.satellitesIds } },
        { sid: { $in: interestedSatellites.satellitesIds } },
      ],
    };
    const interestedConjunctions = await PpdbModel.find(queryOption);
    return interestedConjunctions;
  }

  async createOrUpdateInterestedSatelliteId(email, interestedSatelliteId) {
    ///  Temp... you will change this method use input parameter ///////////////////
    const searchedSatellites = await TleModel.findOne({
      id: interestedSatelliteId,
    });
    ///  Temp... you will change this method use input parameter ///////////////////
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const interestedSatellites = InterestedSatellitesModel.findOneAndUpdate(
      {
        email,
      },
      {
        $addToSet: {
          satellitesIds: interestedSatelliteId,
          satellitesNames: searchedSatellites.name,
        },
      },
      options
    );
    return interestedSatellites;
  }

  async deleteInterestedSatelliteId(email, interestedSatelliteId) {
    ///  Temp... you will change this method use input parameter ///////////////////
    const searchedSatellites = await TleModel.findOne({
      id: interestedSatelliteId,
    });
    ///  Temp... you will change this method use input parameter ///////////////////
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const interestedSatellites = InterestedSatellitesModel.findOneAndUpdate(
      {
        email,
      },
      {
        $pull: {
          satellitesIds: interestedSatelliteId,
          satellitesNames: searchedSatellites.name,
        },
      },
      options
    );
    return interestedSatellites;
  }

  async isMyInterestedSatellites(searcedSatelliteId, interestedSatellites) {
    return interestedSatellites.satellitesIds.includes(searcedSatelliteId);
  }
}
module.exports = InterestedSatellitesService;
