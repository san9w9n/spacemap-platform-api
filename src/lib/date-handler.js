class DateHandler {
  static getCurrentUTCDate() {
    const date = new Date();
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      date: date.getUTCDate(),
      day: date.getUTCDay(),
      hours: date.getUTCHours(),
    };
  }

  static getformattedDateElement(dateElement) {
    return `0${dateElement}`.slice(-2);
  }

  static getFormatDate(year, month, date, hours) {
    const formattedMonth = this.getformattedDateElement(month);
    const formattedDate = this.getformattedDateElement(date);
    const formattedHours = this.getformattedDateElement(hours);
    return `${year}-${formattedMonth}-${formattedDate}-${formattedHours}`;
  }

  static getCurrentFormatDate() {
    const { year, month, date, hours } = this.getCurrentUTCDate();
    return this.getFormatDate(year, month, date, hours);
  }

  static getCertainFormatDate(year, month, date, hours) {
    return this.getFormatDate(year, month, date, hours);
  }

  static isTleDatabaseCleanDay = () => {
    const { day, hours } = this.getCurrentUTCDate();
    return day === 0 && hours === 0;
  };
}

module.exports = DateHandler;
