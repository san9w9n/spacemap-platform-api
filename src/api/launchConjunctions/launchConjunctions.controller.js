/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const LaunchConjunctionsService = require('./launchConjunctions.service');
const upload = require('../../lib/file-upload');
const SshHandler = require('../../lib/ssh-handler');

class LaunchConjunctionsController {
  /** @param { LaunchConjunctionsService } launchConjunctionsService */
  constructor(launchConjunctionsService) {
    this.launchConjunctionsService = launchConjunctionsService;
    this.path = '/launch-conjunctions';
    this.router = Router();
    this.sshHandler = new SshHandler();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.readLaunchConjunctions.bind(this)))
      .get(
        '/:lpdb-conjunctions',
        wrapper(this.findLauncConjunctions.bind(this))
      )
      .post(
        '/',
        upload.single('trajectory'),
        wrapper(this.predictLaunchConjunctions.bind(this))
      )
      .delete('/:lpdb', wrapper(this.deleteLaunchConjunctions.bind(this)));
  }

  async readLaunchConjunctions(req, _res) {
    return null;
  }

  async findLauncConjunctions(req, _res) {
    console.log('?');
    return null;
  }

  async predictLaunchConjunctions(req, _res) {
    console.log(req.file);
    await this.sshHandler.connect();
    await this.sshHandler.exec();
    return { message: 'hi' };
  }

  async deleteLaunchConjunctions(req, _res) {
    return null;
  }
}

module.exports = LaunchConjunctionsController;
