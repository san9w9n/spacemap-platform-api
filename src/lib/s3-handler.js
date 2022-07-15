const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const moment = require('moment');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer(
  {
    storage: multerS3({
      s3,
      bucket: 'spacemap',
      key(req, file, cb) {
        // 메타데이터 핸들링
        //   const { email } = req.user;
        const email = 'sjb9902@hanyang.ac.kr';
        const uniqueSuffix = `${moment().format('YYYY-MM-DD-hh:mm:ss')}`;
        const extension = path.extname(file.originalname);
        cb(
          null,
          `lca/input/${email}/${file.fieldname}-${uniqueSuffix}${extension}`,
        );
      },
      acl: 'public-read-write',
    }),
    //   limits: { fileSize: 50 * 1024 * 1024 },
  },
  'NONE',
);

// const deleteObjectByKey = async (key) => {
//   s3.deleteObject({ Bucket: 'spacemap', Key: key }, (err, data) => {
//     return data;
//   });
// };

module.exports = upload;
