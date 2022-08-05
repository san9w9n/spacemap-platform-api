const AWS = require('aws-sdk');

class S3Handler {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async getObjectListsFromS3() {
    let params = {
      Bucket: 'spacemap',
      Delimiter: '/',
      Prefix: 'tles/',
    };
    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2(params, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  async getObjectFromS3(tleName) {
    let params = {
      Bucket: 'spacemap',
      Key: `tles/${tleName}.tle`,
    };
    return new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
}

module.exports = S3Handler;
