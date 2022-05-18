const moment = require('moment');

class DateHandler {
  static #startMomentOfPredictionWindow = moment()
    .utc()
    .startOf('day')
    .toISOString();

  static #endMomentOfPredictionWindow = moment()
    .utc()
    .add(2, 'd')
    .startOf('day')
    .toISOString();

  static getCertainUTCDate(
    year,
    month,
    date,
    hours = 0,
    min = 0,
    sec = 0,
    ms = 0
  ) {
    return new Date(Date.UTC(year, month - 1, date, hours, min, sec, ms));
  }

  static getRelativeUTCDate(addSec, year, month, date, hours, min, sec, ms) {
    const dateObj = this.getCertainUTCDate(
      year,
      month,
      date,
      hours,
      min,
      sec,
      ms
    );
    dateObj.setSeconds(dateObj.getSeconds() + sec);
    return dateObj;
  }

  static getMilliSecondFromSecond(sec) {
    const splitSec = sec.split('.');
    if (splitSec.length <= 1) {
      return 0;
    }
    return Number(splitSec[1]);
  }

  static getCurrentUTCDate() {
    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const date = currentDate.getUTCDate();
    const hours = currentDate.getUTCHours();
    return this.getCertainUTCDate(year, month, date, hours);
  }

  static #getformattedDateElement(dateElement) {
    return `0${dateElement}`.slice(-2);
  }

  /**
   * @param {Date} dateObj
   */
  static #getFileName(dateObj) {
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const date = dateObj.getUTCDate();
    const hours = dateObj.getUTCHours();

    const formattedMonth = this.#getformattedDateElement(month);
    const formattedDate = this.#getformattedDateElement(date);
    const formattedHours = this.#getformattedDateElement(hours);
    return `${year}-${formattedMonth}-${formattedDate}-${formattedHours}`;
  }

  static getFileNameByCurrentDate() {
    const currentDate = this.getCurrentUTCDate();
    return this.#getFileName(currentDate);
  }

  static getFileNameByCertainDate(year, month, date, hours) {
    const certainDate = this.getCertainUTCDate(year, month, date, hours);
    return this.#getFileName(certainDate);
  }

  static getFileNameByDateObject(dateObj) {
    return this.#getFileName(dateObj);
  }

  static isTleDatabaseCleanDay = () => {
    const currentDate = this.getCurrentUTCDate();
    const day = currentDate.getUTCDay();
    const hours = currentDate.getUTCHours();
    return day === 0 && hours === 0;
  };

  static getElementsFromDateObject(dateObj) {
    return {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth(),
      date: dateObj.getDate(),
    };
  }

  static async isValidDate(launchEpochTime) {
    if (
      moment(launchEpochTime).isSameOrAfter(
        moment(this.#startMomentOfPredictionWindow)
      ) &&
      moment(launchEpochTime).isSameOrBefore(
        moment(this.#endMomentOfPredictionWindow)
      )
    )
      return true;
    return false;
  }

  static async diffSeconds(launchEpochTime) {
    const diffSeconds = moment(launchEpochTime).diff(
      moment(this.#startMomentOfPredictionWindow),
      'seconds'
    );
    return diffSeconds;
  }

  static getStartMomentOfPredicWindow() {
    return moment(this.#startMomentOfPredictionWindow);
  }

  static getMomentOfString(stringDate) {
    return moment(stringDate);
  }

  static isCalculatableDate() {
    const currentDate = this.getCurrentUTCDate();
    const hours = currentDate.getHours();
    return hours < 15 || hours >= 20;
  }
}

module.exports = DateHandler;
