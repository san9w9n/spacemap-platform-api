/* eslint-disable no-console */
const Client = require('ssh2-sftp-client');

class SftpHandler {
  constructor() {
    this.sftp = new Client();
  }

  async #connect() {
    return this.sftp.connect({
      host: process.env.SSH2_HOST,
      port: process.env.SSH2_PORT,
      username: process.env.SSH2_USERNAME,
      password: process.env.SSH2_PASSWORD,
    });
  }

  async #end() {
    return this.sftp.end();
  }

  async getFile(fromPath, toPath) {
    await this.#connect();
    let flag = false;
    try {
      await this.sftp.fastGet(fromPath, toPath);
      flag = true;
    } catch (err) {
      console.error(err);
      flag = false;
    } finally {
      await this.#end();
    }
    return flag;
  }

  async putFile(fromPath, toPath) {
    await this.#connect();
    let flag = false;
    try {
      await this.sftp.fastPut(fromPath, toPath);
      flag = true;
    } catch (err) {
      console.error(err);
      flag = false;
    } finally {
      await this.#end();
    }
    return flag;
  }

  async mkdir(toDir) {
    await this.#connect();
    let flag = false;
    try {
      await this.sftp.mkdir(toDir);
      flag = true;
    } catch (err) {
      console.error(err);
      flag = false;
    } finally {
      await this.#end();
    }
    return flag;
  }
}

module.exports = SftpHandler;
