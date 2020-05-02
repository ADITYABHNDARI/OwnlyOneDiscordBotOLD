const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'afking',
    // aliases: ['funny', 'whatis'],
    description: 'Defines a given query.',
    // args: true,
    cooldown: 5,
    usage: '<Time in minutes>',
    category: 'images'
  },
  async execute (message, args) {
    message.author.user.setActivity(`afk for ${args}minutes`).catch(console.error);
  }
};