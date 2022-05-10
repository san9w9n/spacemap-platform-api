/* eslint-disable class-methods-use-this */
const InterestedSatellitesModel = require('./interestedSatellites.model');
const TleModel = require('../tles/tle.model');

class InterestedSatellitesService {
  async readInterestedSatellites(email) {
    console.log(email);
    const interestedSatellites = InterestedSatellitesModel.find({ email });
    return interestedSatellites;
  }

  async findSatellitesByIdService(satelliteID) {
    console.log('ID: ', satelliteID);
    const searchedSatellites = await TleModel.find({ id: satelliteID });
    return searchedSatellites;
  }

  async findSatellitesByNameService(satelliteName) {
    console.log('Name: ', satelliteName);
    const queryOption = {
      name: { $regex: satelliteName, $options: 'i' },
    };
    const searchedSatellites = await TleModel.find(queryOption);
    return searchedSatellites;
  }

  async createOrUpdateInterestedSatelliteID(email, interestedSatelliteID) {
    console.log(email, interestedSatelliteID);
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
}
module.exports = InterestedSatellitesService;
