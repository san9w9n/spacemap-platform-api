const AWS = require('aws-sdk');
const moment = require('moment');
const path = require('path');
const EngineCommand = require('../../lib/engine-command');

class S3Handler {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.s3FileName = undefined;
    this.s3FilePath = undefined;
  }

  async setS3FileName(trajectory) {
    const uniqueSuffix = `${moment().utc().format('YYYY-MM-DD-hh:mm:ss')}`;
    const extension = path.extname(trajectory.file.originalname);
    this.s3FileName = `${trajectory.email}-${trajectory.file.fieldname}-${uniqueSuffix}${extension}`;
  }

  async setS3FilePath(trajectory) {
    this.s3FilePath = await this.getObjectUrlFromS3(trajectory);
  }

  async uploadFile(trajectory) {
    let params = {
      Bucket: 'spacemap',
      ACL: 'public-read-write',
      Key: `lca/input/${trajectory.email}/${this.s3FileName}`,
      Body: trajectory.file.buffer,
    };
    return new Promise((resolve, reject) => {
      this.s3.putObject(params, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  async getObjectUrlFromS3(trajectory) {
    let params = {
      Bucket: 'spacemap',
      Key: `lca/input/${trajectory.email}/${this.s3FileName}`,
    };
    const s3Url = this.s3.getSignedUrl('getObject', params);
    return s3Url;
  }

  async makeFilePath(trajectory) {
    const remoteFolder = `${EngineCommand.homeDirectory}${trajectory.email}/`;
    const outputName = `${this.s3FileName.split('.txt')[0]}-LPDB.txt`;
    return {
      remoteInputFilePath: `${remoteFolder}${this.s3FileName}`,
      remoteOutputFilePath: `${remoteFolder}out_${this.s3FileName}`,
      s3InputFileKey: `lca/input/${trajectory.email}/${this.s3FileName}`,
      s3OutputFileKey: `lca/output/${trajectory.email}/${outputName}`,
    };
  }
}

module.exports = S3Handler;
