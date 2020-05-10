const { MessageEmbed } = require( 'discord.js' );

module.exports = {
  config: {
    name: 'avatar',
    aliases: [ 'dp', 'pfp' ],
    description: 'Shows the current discord avatar unless not mentioned someone!',
    usage: '<mention-user> or *blank*',
    cooldown: 2,
    category: 'image',
  },
  execute ( message, args ) {
    const user = message.mentions.users.first() || message.author;
    const imageEmbed = new MessageEmbed()
      .setAuthor( `Requested By: ${ message.author.username }` )
      .setImage( user.displayAvatarURL( { format: 'png', dynamic: true } ) );
    return message.channel.send( imageEmbed );
  },
};
