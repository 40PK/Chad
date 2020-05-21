class Signal {
  constructor() {
    this.signals = {};
  }

  register(type, cb) {
    this.signals[type] = cb;
  }

  call(type, args) {
    return this.signals[type].apply(null, args);
  }
}

module.exports = Signal;
