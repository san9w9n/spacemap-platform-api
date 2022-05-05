const fs = require('fs');
const { promisify } = require('util');

const promiseReadFile = promisify(fs.readFile);
const promiseWriteFile = promisify(fs.writeFile);

module.exports = {
  promiseReadFile,
  promiseWriteFile,
};
