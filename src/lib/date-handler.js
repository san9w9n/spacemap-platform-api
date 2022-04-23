const getCurrentUTCDate = () => {
  const date = new Date();
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    whichDay: date.getUTCDay(),
    hours: date.getUTCHours(),
  };
};

/**
 * @param {Number} dateElement
 * @returns {String}
 */
const getformattedDateElement = (dateElement) => {
  return `0${dateElement}`.slice(-2);
};

/**
 * @returns {String}
 */
const getCurrentFormatDate = () => {
  const { year, month, day, hours } = getCurrentUTCDate();
  const formattedMonth = getformattedDateElement(month);
  const formattedDay = getformattedDateElement(day);
  const formattedHours = getformattedDateElement(hours);
  return `${year}-${formattedMonth}-${formattedDay}-${formattedHours}`;
};

const getFormatDate = (year, month, day, hours) => {
  const formattedMonth = getformattedDateElement(month);
  const formattedDay = getformattedDateElement(day);
  const formattedHours = getformattedDateElement(hours);
  return `${year}-${formattedMonth}-${formattedDay}-${formattedHours}`;
};

const isTleTableClearDay = () => {
  const { day, hours } = getCurrentFormatDate();
  return day === 0 && hours === 0;
};

module.exports = {
  getFormatDate,
  getCurrentFormatDate,
  isTleTableClearDay,
};
