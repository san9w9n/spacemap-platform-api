const moment = require('moment');

const startMomentOfPredictionWindow = moment()
  .utc()
  .startOf('day')
  .toISOString();
const endMomentOfPredictionWindow = moment()
  .utc()
  .add(2, 'd')
  .startOf('day')
  .toISOString();

module.exports = { startMomentOfPredictionWindow, endMomentOfPredictionWindow };
