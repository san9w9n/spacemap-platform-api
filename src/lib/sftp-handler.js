const Client = require('ssh2-sftp-client');

class SftpHandler {
  constructor() {
    this.sftp = new Client();
  }

  async connect() {
    return this.sftp.connect({
      host: process.env.SSH2_HOST,
      port: process.env.SSH2_PORT,
      username: process.env.SSH2_USERNAME,
      password: process.env.SSH2_PASSWORD,
    });
  }

  async end() {
    return this.sftp.end();
  }

  async getFile(fromPath, toPath) {
    return this.sftp.fastGet(fromPath, toPath);
  }

  async putFile(fromPath, toPath) {
    return this.sftp.fastPut(fromPath, toPath);
  }

  async mkdir(toDir) {
    return this.sftp.mkdir(toDir);
  }
}

module.exports = SftpHandler;
