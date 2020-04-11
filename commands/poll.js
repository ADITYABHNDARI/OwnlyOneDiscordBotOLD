module.exports = {
  config: {
    name: 'poll',
    // aliases: ['delete', 'remove'],
    description: 'Polls',
    cooldown: 10,
    usage: '<Enter poll Title here>',
    category: 'miscellaneous'
  },
  execute (message, args) {
    // const question = args.join(' ');
    message.react('👍')
      .then(() => message.react('🤷'))
      .then(() => message.react('👎'))
      // .then(() => message.react('🇧'))
      .catch(() => console.error('One of the emojis failed to react.'));
  }
};