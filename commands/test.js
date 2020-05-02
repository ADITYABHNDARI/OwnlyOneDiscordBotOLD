const { MessageEmbed } = require('discord.js');
const ReactionButton = require('./../classes/ReactionButton.js');

module.exports = {
  config: {
    name: 'test',
    aliases: ['tst'],
    description: 'Just a testing command',
    cooldown: 1,
    category: 'nothing'
  },
  async execute (message, args) {
    const embed = new MessageEmbed()
      .setTitle('Wada Boom Boom!')
      .setDescription(`hello there is somethisn \n tis si a ne line\n **another new line with boldness**`)

    const emojies = new Map();
    emojies.set('😆', () => console.log('You reacted haha'));
    emojies.set('😝', () => console.log('You reacted toungue out'));
    emojies.set('👍', () => console.log('You reacted thumbup'));
    const hey = await message.channel.send(embed);
    /* hey.createReactionCollector(() => true)
      .on('collect', (reaction, user) => {
        // console.log(reaction.id, reaction.name, reaction.identifier, reaction);
        emojies.get(reaction.emoji.name)();
      })
      .on('remove', (reaction, user) => {
        console.log('reaction removed by ' + user.username);
      }); */
    const filter = (reaction, user) => {
      return true;
    };
    new ReactionButton(hey, emojies, filter);
  }
};