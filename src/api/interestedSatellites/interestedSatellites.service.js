/* eslint-disable class-methods-use-this */
const InterestedSatellitesModel = require('./interestedSatellites.model');
const TleModel = require('../tles/tle.model');

class InterestedSatellitesService {
  async readInterestedSatellites(email) {
    const interestedSatellites = InterestedSatellitesModel.findOne({ email });
    return interestedSatellites;
  }

  async findSatellitesByIdService(email, satelliteID) {
    const interestedSatellites = await InterestedSatellitesModel.findOne({
      email,
    });
    const searchedSatellites = await TleModel.find({ id: satelliteID });
    const searchedSatellitesWithInterested = [];
    searchedSatellites.forEach(async (searchedSatellite) => {
      const isInterested = await this.isMyInterestedSatellites(
        searchedSatellite.id,
        interestedSatellites
      );
      searchedSatellitesWithInterested.push({
        id: searchedSatellite.id,
        name: searchedSatellite.name,
        isInterested,
      });
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
      const isInterested = await this.isMyInterestedSatellites(
        searchedSatellite.id,
        interestedSatellites
      );
      searchedSatellitesWithInterested.push({
        id: searchedSatellite.id,
        name: searchedSatellite.name,
        isInterested,
      });
    });
    return searchedSatellitesWithInterested;
  }

  async createOrUpdateInterestedSatelliteID(email, interestedSatelliteID) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const interestedSatellites = InterestedSatellitesModel.findOneAndUpdate(
      {
        email,
      },
      { $addToSet: { satellitesIDs: interestedSatelliteID } },
      options
    );
    return interestedSatellites;
  }

  async deleteInterestedSatelliteID(email, interestedSatelliteID) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const interestedSatellites = InterestedSatellitesModel.findOneAndUpdate(
      {
        email,
      },
      { $pull: { satellitesIDs: interestedSatelliteID } },
      options
    );
    return interestedSatellites;
  }

  async isMyInterestedSatellites(searcedSatelliteID, interestedSatellites) {
    return interestedSatellites.satellitesIDs.includes(searcedSatelliteID);
  }
}
module.exports = InterestedSatellitesService;
