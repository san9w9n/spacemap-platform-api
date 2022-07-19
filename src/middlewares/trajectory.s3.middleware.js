const TrajectoryHandler = require('../lib/trajectory-handler');
const DateHandler = require('../lib/date-handler');
const S3Handler = require('../lib/s3-handler');

const {
  BadRequestException,
  ForbiddenException,
} = require('../common/exceptions');

const isValidTrajectory = async (file, threshold) => {
  if (!DateHandler.isCalculatableDate()) {
    throw new ForbiddenException('Not available time.');
  }

  if (!file) {
    throw new BadRequestException('No Trajectory File.');
  }

  if (!threshold) {
    throw new BadRequestException('Empty Threshold field.');
  }

  return true;
};

const uploadToS3 = async (email, file) => {
  const s3Handler = new S3Handler();
  const { s3FileName, s3FileBuffer } =
    await TrajectoryHandler.getS3NameAndBuffer(email, file);
  await s3Handler.uploadTrajectory(email, s3FileName, s3FileBuffer);
  return s3FileName;
};

module.exports = {
  isValidTrajectory,
  uploadToS3,
};
