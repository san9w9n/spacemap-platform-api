const Client = require('ssh2-sftp-client');

class SftpHandler {
  constructor() {
    this.sftp = new Client();
  }

  async connect() {
    return this.sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });
  }

  async end() {
    return this.sftp.end();
  }

  async getFile(fromPath, toPath) {
    return this.sftp.fastGet(fromPath, toPath);
  }
}

module.exports = SftpHandler;
