const fs = require('fs');
const { promisify } = require('util');
const TleModel = require('./tle.model');

const promiseReadFile = promisify(fs.readFile);

const createTles = async (date, tleTexts) => {
  /** @type [String] */
  const tleArray = tleTexts.split('\r\n');
  const tleArrayLength = tleArray.length;
  const tles = [];
  for (let i = 0; i < tleArrayLength; i += 3) {
    const name = tleArray[i].slice(2, tleArray[i].length);
    const firstline = tleArray[i + 1];
    const secondline = tleArray[i + 2];

    if (name && firstline && secondline) {
      tles.push({
        date,
        name,
        firstline,
        secondline,
      });
    }
  }

  await TleModel.insertMany(tles);
};

const deleteAllTles = async () => {
  await TleModel.deleteMany({});
};

const deleteAllTlesByDate = async (year, month, day, hours) => {
  const date = `${year}-${`0${month}`.slice(-2)}-${`0${day}`.slice(
    -2
  )}-${`0${hours}`.slice(-2)}`;
  await TleModel.deleteMany({ date });
};

const searchTlesByNameDate = async (name, year, month, day, hours = 0) => {
  const date = `${year}-${`0${month}`.slice(-2)}-${`0${day}`.slice(
    -2
  )}-${`0${hours}`.slice(-2)}`;
  const tles = await TleModel.find({ date, name });
  if (tles && tles.length > 0) return tles;
  const tleFromFile = await promiseReadFile(`./public/tle/${date}.tle`, {
    encoding: 'utf-8',
  });
  await createTles(date, tleFromFile);
  const reTles = await TleModel.find({ date, name });
  return reTles;
};

const searchAllTles = async () => {
  const tles = await TleModel.find({});
  return tles;
};

module.exports = {
  createTles,
  deleteAllTlesByDate,
  deleteAllTles,
  searchTlesByNameDate,
  searchAllTles,
};
