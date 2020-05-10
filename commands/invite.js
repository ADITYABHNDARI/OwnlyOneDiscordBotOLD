const { MessageEmbed } = require( 'discord.js' );

module.exports = {
  config: {
    name: 'invite',
    aliases: ['join'],
    description: 'Provides a invite link for the bot!',
    // incomplete: true,
    category: 'information',
  },

  async execute ( message ) {
    message.reply(
      new MessageEmbed()
        .setAuthor( 'Wanna invite me, to your server!', null, await message.client.generateInvite() )
        .setFooter(
          message.client.user.username,
          message.client.user.displayAvatarURL( { format: 'jpg', dynamic: true } )
        )
    );
  },
};
