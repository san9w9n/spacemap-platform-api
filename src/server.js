const TleController = require('./api/tles/tle.controller');
const App = require('./app');
const Database = require('./lib/database');
const TleTask = require('./api/tles/tle.task');

const main = async () => {
  await Database.initializeDatabase();
  const tleTask = new TleTask('0 0 0 * * *');
  const app = new App([new TleController()]);
  app.listen();
  tleTask.startTask();
};

main();
