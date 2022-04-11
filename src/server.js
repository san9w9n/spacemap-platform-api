const TemplateController = require('./api/templates/template.contollers');
const App = require('./app');
const Database = require('./lib/database');

const main = async () => {
  await Database.initializeDatabase();
  const app = new App([new TemplateController()]);
  app.listen();
};
main();
