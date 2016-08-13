class Utils {
  static getDateString(date) {
    return date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + ' ' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2);
  }

  static s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
  }

  static uid() {
    return Utils.s4() + Utils.s4();
  }

  static uid2() {
    return Utils.s4() + Utils.s4() + Utils.s4() + Utils.s4();
  }
}

module.exports = Utils;
