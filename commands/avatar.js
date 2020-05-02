const { MessageEmbed } = require('discord.js');

// inside a command, event listener, etc.


module.exports = {
  config: {
    name: 'avatar',
    aliases: ['dp', 'pfp'],
    description: 'helps to delete multiple messages in the channel.',
    cooldown: 1,
    category: 'image'
  },
  execute (message, args) {
    const imageEmbed = new MessageEmbed()
      .setAuthor(`Requested By: ${message.author.username}`);
    let imageOf = null;
    if (!args.length) {
      // self avatar
      // dynamic gives .gif format if img is animated or the specified format or .webp otherwise.
      imageOf = message.author;
    } else {
      imageOf = message.mentions.users.first();

    }
    console.log(imageOf);
    imageEmbed.setImage(imageOf.displayAvatarURL({ format: "png", dynamic: true }));
    return message.channel.send(imageEmbed);


    const exampleEmbed = new MessageEmbed()
      .setColor('#f090ff')
      .setTitle('Some title')
      .setURL('https://discord.js.org/')
      .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
      .setDescription('Some description here')
      .setThumbnail('https://i.imgur.com/wSTFkRM.png')
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true }
      )
      .addField('Inline field title', 'Some value here', true)
      .setImage('https://i.imgur.com/wSTFkRM.png')
      .setTimestamp()
      .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
    message.channel.send(exampleEmbed);
  }
};



const exampleEmbed = {
  color: 0x0099ff,
  title: 'Some title',
  url: 'https://discord.js.org',
  author: {
    name: 'Some name',
    icon_url: 'https://i.imgur.com/wSTFkRM.png',
    url: 'https://discord.js.org',
  },
  description: 'Some description here',
  thumbnail: {
    url: 'https://i.imgur.com/wSTFkRM.png',
  },
  fields: [
    {
      name: '\u200b',
      value: '\u200b',
      inline: false,
    }
  ],
  image: {
    url: 'https://i.imgur.com/wSTFkRM.png',
  },
  timestamp: new Date(),
  footer: {
    text: 'Some footer text here',
    icon_url: 'https://i.imgur.com/wSTFkRM.png',
  }
};