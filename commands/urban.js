const fetch = require('node-fetch');
const querystring = require('querystring');
const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'urban',
    aliases: ['define', 'whatis'],
    description: 'Defines a given query.',
    args: true,
    cooldown: 10,
    usage: '<query>',
    category: 'miscellaneous'
  },
  async execute (message, args) {
    const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
    const query = querystring.stringify({ term: args.join(' ') });

    const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
    // const data = await fetch(`https://www.google.co.in/search?q=define%20${args.join(' ')}#cns=1`).then(response => response.json());

    const [answer] = list;

    const embed = new MessageEmbed()
      .setColor('#EFFF00')
      .setTitle(answer.word)
      .setURL(answer.permalink)
      .addFields(
        { name: 'Definition', value: trim(answer.definition, 1024) },
        { name: 'Example', value: trim(answer.example, 1024) }
      )
      .setFooter(`👍 ${answer.thumbs_up} | 👎 ${answer.thumbs_down}`);

    message.channel.send(embed);
  }
};