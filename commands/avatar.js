const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'avatar',
    aliases: ['dp', 'pfp'],
    description: 'Shows the current discord avatar unless not mentioned someone!',
    usage: '<mention-user> or *blank*',
    cooldown: 2,
    category: 'image'
  },
  execute (message, args) {
    const imageEmbed = new MessageEmbed()
      .setAuthor(`Requested By: ${message.author.username}`);

    const imageOf = !args.length ? message.author : message.mentions.users.first();
    // dynamic gives .gif format if img is animated or the specified format or .webp otherwise.
    imageEmbed.setImage(imageOf.displayAvatarURL({ format: "png", dynamic: true }));
    return message.channel.send(imageEmbed);
  }
};