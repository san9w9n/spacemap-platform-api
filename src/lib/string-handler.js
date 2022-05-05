class StringHandler {
  static isNumeric(inputString) {
    if (!inputString) {
      return false;
    }
    const stringId = inputString.replace(/^\s*|\s*$/g, '');
    if (stringId === '' || Number.isNaN(Number(stringId))) {
      return false;
    }
    return true;
  }

  static isNotComment(rawPpdb) {
    if (!rawPpdb || rawPpdb.length <= 1) {
      return false;
    }
    return rawPpdb[0] !== '%';
  }

  static isValidString(string) {
    return string && string.length > 0;
  }
}

module.exports = StringHandler;
