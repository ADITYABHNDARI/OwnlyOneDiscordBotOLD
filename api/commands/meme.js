const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'meme',
    aliases: ['funny', 'whatis'],
    description: 'Posts a random meme.',
    // args: true,
    // cooldown: 2,
    usage: '',
    category: 'images'
  },
  async execute (message, args) {
    const meme = await fetch('https://meme-api.herokuapp.com/gimme').then(response => response.json());
    // const meme = data.data.memes[Math.random() * data.data.memes.length | 0];
    const embed = new MessageEmbed()
      .setColor('#EFFF00')
      .setTitle(meme.title)
      .setURL(meme.url)
      .setImage(meme.url);

    message.channel.send(embed);
  }
};