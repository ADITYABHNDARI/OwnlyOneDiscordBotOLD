const options = {
  sequence: false,
  cooldown: 3
};

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

class ReactionButton {
  constructor(message, emojies, filter) {
    this.message = message;
    this.emojies = emojies;
    this.user = null;
    this.cooldown = new Cooldown(options.cooldown);
    this.collector = message.createReactionCollector(
      (reaction, user) => {
        if (user.bot || !emojies.has(reaction.emoji.name)) return false;
        reaction.users.remove(user);

        return !this.cooldown.isRunning && filter(reaction, user);
      }
    ).on('collect', (reaction, user) => {
      this.user = user;
      this.cooldown.start();
      const action = emojies.get(reaction.emoji.name);
      if (!action) return;
      action();
      reaction.users.remove(user);
    });
    this.reactEmoji([...emojies.keys()])
  }

  reactEmoji (emojies) {
    if (!emojies.length) return;
    this.message.react(emojies.shift()).then(() => this.reactEmoji(emojies));
  }
}

module.exports = ReactionButton;



/* "ffmpeg-static": "^4.1.0", */