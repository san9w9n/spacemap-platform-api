class DateHandler {
  static getCertainUTCDate(year, month, date, hours) {
    return new Date(Date.UTC(year, month - 1, date, hours, 0, 0, 0));
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

  /**
   * @param {Date} dateObj
   */
  static getFileNameByDateObject(dateObj) {
    return this.#getFileName(dateObj);
  }

  static isTleDatabaseCleanDay = () => {
    const currentDate = this.getCurrentUTCDate();
    const day = currentDate.getUTCDay();
    const hours = currentDate.getUTCHours();
    return day === 0 && hours === 0;
  };
}

module.exports = DateHandler;
