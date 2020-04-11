module.exports = {
  config: {
    name: 'chat',
    aliases: ['talk'],
    description: 'helps to delete multiple messages in the channel.',
    cooldown: 10,
    category: 'miscellaneous'
  },
  execute (message, args) {
    const msg = args.join(' ').toLowerCase();
    if (['hello', 'hi'].includes(msg)) {
      message.reply('Hey! How are you?');
    } else {
      message.reply('Sorry! I don\'t talk too much.');
    }
  }
};