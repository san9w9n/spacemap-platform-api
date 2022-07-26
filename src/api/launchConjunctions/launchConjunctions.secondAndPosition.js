/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

const { BadRequestException } = require('../../common/exceptions');
const StringHandler = require('../../lib/string-handler');

class SecondAndPosition {
  constructor(line) {
    this.words = line.split(/[\t\s,]+/);
    this.time = this.words[0];
    this.x = this.words[1];
    this.y = this.words[2];
    this.z = this.words[3];
  }

  isAllValidParams(time, x, y, z) {
    return (
      StringHandler.isValidString(time) &&
      StringHandler.isValidString(x) &&
      StringHandler.isValidString(y) &&
      StringHandler.isValidString(z)
    );
  }

  setSecondAndPosition(diffSeconds) {
    if (!this.isAllValidParams(this.time, this.x, this.y, this.z)) {
      throw new BadRequestException('Invalid trajectory file.');
    }

    return `${Number(this.time) + diffSeconds}\t${this.x}\t${this.y}\t${
      this.z
    }\n`;
  }
}

module.exports = SecondAndPosition;
