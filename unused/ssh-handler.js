const Client = require('ssh2-promise');
const StringHandler = require('./string-handler');

//test
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

  async execCalculate(command) {
    await this.#connect();
    let result = -1;
    let message = 'failed.';
    try {
      const exitCode = await this.ssh.exec(`${command} > /dev/null && echo $?`);
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

  async execCalculateWithoutCheckingError(command) {
    await this.#connect();
    let result = -1;
    let message = 'failed.';
    const exitCode = await this.ssh.exec(
      `${command} > /dev/null 2>&1  && echo $?`,
    );
    result = Number(exitCode);
    message = result === 0 ? 'calculate success.' : 'calculate failed.';
    this.#end();
    return {
      result,
      message,
    };
  }

  async writeTextToFile(text, filePath) {
    await this.#connect();
    let result = -1;
    let message = 'failed.';
    try {
      const exitCode = await this.ssh.exec(`echo -n ${text} > ${filePath}`);
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

  async execTop() {
    await this.#connect();
    let cpuUsagePercent = 100;
    try {
      const data = await this.ssh.exec(
        "mpstat | tail -1 | awk '{print 100-$NF}'",
      );
      if (data && StringHandler.isNumeric(data)) {
        cpuUsagePercent = Number(data);
      }
    } finally {
      await this.#end();
    }
    return cpuUsagePercent;
  }
}

module.exports = SshHandler;
