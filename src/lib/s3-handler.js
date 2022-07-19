const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const moment = require('moment');

class S3Handler {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadTrajectory(s3FileName, fileContent) {
    let params = {
      Bucket: 'spacemap',
      ACL: 'public-read-write',
      Key: `lca/input/${s3FileName}`,
      Body: fileContent,
    };
    return new Promise((resolve, reject) => {
      this.s3.putObject(params, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  async getS3ObjectUrl(s3FileName) {
    let params = {
      Bucket: 'spacemap',
      Key: `lca/input/${s3FileName}`,
    };
    const s3Url = this.s3.getSignedUrl('getObject', params);
    return s3Url;
  }
}

module.exports = S3Handler;
