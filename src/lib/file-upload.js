const path = require('path');
const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename(req, file, cb) {
    // const { email } = req.user;
    const email = 'sjb9902@hanyang.ac.kr';
    const uniqueSuffix = `${moment().format('YYYY-MM-DD-hh:mm:ss')}`;
    const extension = path.extname(file.originalname);
    cb(null, `${email}-${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const memory = multer.memoryStorage();

const upload = multer({ storage });
const memoryUpload = multer({ memory });
module.exports = { upload, memoryUpload };
