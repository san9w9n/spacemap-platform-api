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

  async #connect() {
    return this.ssh.connect();
  }

  async #end() {
    return this.ssh.close();
  }

  async exec(command) {
    await this.#connect();
    let result = -1;
    let message = 'failed.';
    try {
      const exitCode = await this.ssh.exec(`${command} > /dev/null ; echo $?`);
      result = Number(exitCode);
      message = result === 0 ? 'calculate success.' : 'calculate failed.';
    } catch (err) {
      result = -1;
      message = err;
    } finally {
      await this.#end();
    }
    return {
      result,
      message,
    };
  }
}

module.exports = SshHandler;
