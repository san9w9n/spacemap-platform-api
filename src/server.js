const TemplateController = require('./api/templates/template.contollers');
const App = require('./app');
const Database = require('./lib/database');
const tleTask = require('../modules/tle/tle.scheduler');

const main = async () => {
  await Database.initializeDatabase();
  const app = new App([new TemplateController()]);
  app.listen();
  tleTask.start();
};

main();
