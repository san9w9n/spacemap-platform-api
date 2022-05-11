const Client = require('ssh2-promise');
const { BadRequestException } = require('../common/exceptions');

class SshHandler {
  constructor() {
    this.sshConfig = {
      host: process.env.SSH2_HOST,
      port: process.env.SSH2_PORT,
      username: process.env.SSH2_USERNAME,
      password: process.env.SSH2_PASSWORD,
    };
    this.ssh = new Client(this.sshConfig);
  }

  async connect() {
    return this.ssh.connect();
  }

  async end() {
    return this.ssh.end();
  }

  async exec(command) {
    try {
      this.ssh.exec('whoami').then((data) => {
        console.log(data); // ubuntu
      });
    } catch (err) {
      throw new BadRequestException('Fail to execute command by SSH2.');
    }
  }
}

module.exports = SshHandler;
