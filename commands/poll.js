const { MessageEmbed } = require('discord.js');

const alphaEmojies = ['🇦', '🇧', '🇨', '🇩', '🇪', '', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];

module.exports = {
  config: {
    name: 'poll',
    // aliases: ['delete', 'remove'],
    description: 'Polls',
    cooldown: 10,
    usage: '<Enter poll Title here> [option 1][option 2][option *n*]',
    category: 'miscellaneous'
  },

  execute (message, args) {
    const pollString = args.join(' ');
    if (pollString.endsWith(']')) {
      const partitionIndex = pollString.indexOf('[');
      const title = pollString.slice(0, partitionIndex - 1);
      const options = pollString.slice(partitionIndex).match(/([A-Z\s])*\w+/gi);
      const embed = {
        color: '#0077ff',
        title: `**${title}**`,
        fields: options.map((option, i) => {
          return {
            name: '\u200b',
            value: `${alphaEmojies[i]}  ${option}`
          };
        })
      }
      console.log(title, options, options.length);
      message.channel.send(new MessageEmbed(embed)).then(async poll => {
        for (let i = 0; i < options.length; i++) {
          await poll.react(alphaEmojies[i]);
        }
      });
    } else {
      message.react('👍')
        .then(() => message.react('🤷'))
        .then(() => message.react('👎'))
        // .then(() => message.react('🇧'))
        .catch(() => console.error('One of the emojis failed to react.'));
    }

    "what is poll? [][][]"


  }
};