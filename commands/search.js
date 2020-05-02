// const YouTube = require("discord-youtube-api");
const { MessageEmbed } = require('discord.js');

// const youtube = new YouTube("AIzaSyB070H-hAFt9bOlIxvL8vB3fFE_Mj1Hc5E");

module.exports = {
  config: {
    name: 'search',
    aliases: ['find', 'ff'],
    description: 'Development purpose only',
    cooldown: 10,
    category: 'miscellaneous'
  },
  async execute (message, args) {
    const embed = {
      color: '#ff3333',
      title: 'Chahu Mai ya Na',
      author: {
        name: "Unknown"
      },
      fields: [
        {
          name: 'REgular field',
          value: 'Value here'
        }
      ]
    };
    const embedMsg = await message.channel.send(new MessageEmbed(embed));
    message.channel.send(new MessageEmbed().setColor('#ffff00').setAuthor('Now Playing...'));
    message.channel.send(new MessageEmbed().setColor('#00ff00').setAuthor('Now Playing...'));
    await embedMsg.react('▶️');
    await embedMsg.react('⏯️');
    await embedMsg.react('🎵');


    const reactionCollector = embedMsg.createReactionCollector(
      // filter
      (reaction, user) => {
        console.log(reaction.me);
        return embedMsg.author.id != user.id;
      }
    );

    reactionCollector.on('collect', (reaction, user) => {
      console.log('reaction added');
      reaction.users.remove(user);
      // reaction.message.reactions
    });


    return;
    var song = {
      title: "Sanam re sanamre",
      url: 'https://discord.js.org/',
      addedBy: message.author,
      duration: 45,
      thumbnail: message.author.displayAvatarURL({ format: "png", dynamic: true })
    };

    const exampleEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(song.title)
      .setURL(song.url)
      .setAuthor('Now Playing...')
      .setThumbnail(song.thumbnail)
      .addField(
        '\n\t1. lorem dfhs sdf sdfdfshgs df\n2. dfs dskfjs sdfjs dfkjs',
        '\t3. dsfkjs sdf sjdf s\u200Bdgg'
      )
      .addField(
        '\n\t1. 🎵lorem dfhs sdf sdfdfshgs df\n2. dfs dskfjs sdfjs dfkjs',
        '\u200B'
      )
      // .setImage(song.thumbnail)
      .setFooter(`Added By: ${song.addedBy.username}`, song.addedBy.displayAvatarURL({ format: "png", dynamic: true }));

    message.channel.send(exampleEmbed);
    // console.log(exampleEmbed.toJSON());
  }

};