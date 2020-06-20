class Cooldown {
  constructor(time) {
    this.duration = time * 1000;
    this.isRunning = false;
  }
  start () {
    clearTimeout(this.isRunning);
    this.isRunning = setTimeout(() => this.stop(), this.duration);
  }
  stop () {
    this.isRunning = false;
  }
}

module.exports = Cooldown;