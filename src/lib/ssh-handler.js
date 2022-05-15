const Client = require('ssh2-promise');

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
    return this.ssh.close();
  }

  async exec(command) {
    try {
      const exitCode = await this.ssh.exec(`${command} > /dev/null ; echo $?`);
      return exitCode;
    } catch (err) {
      // console.log(err.toString());
      return -1;
    }

    // this.ssh.exec(command).then(
    //   (data) => {
    //     console.log(data); // ubuntu
    //   },
    //   (err) => {
    //     throw new BadRequestException(
    //       `Fail to execute command by SSH2. (${err})`
    //     );
    //   }
    // );
  }
}

module.exports = SshHandler;
