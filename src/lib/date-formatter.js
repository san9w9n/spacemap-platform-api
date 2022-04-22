const getStringFormatData = (year, month, date, hours) => {
  const numYear = Number(year);
  const numMonth = Number(month);
  const numDate = Number(date);
  const numHours = Number(hours);
  return `${numYear}-${`0${numMonth}`.slice(-2)}-${`0${numDate}`.slice(
    -2
  )}-${`0${numHours}`.slice(-2)}`;
};

module.exports = getStringFormatData;
