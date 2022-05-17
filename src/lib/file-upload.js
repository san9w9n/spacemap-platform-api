const path = require('path');
const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename(req, file, cb) {
    // const { email } = req.user;
    const email = 'sangwon@test.com';
    const uniqueSuffix = `${moment().format('YYYY-MM-DD-hh:mm:ss')}`;
    const extension = path.extname(file.originalname);
    cb(null, `${email}-${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({ storage });
module.exports = upload;
