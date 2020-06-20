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
    const inviteURL = await message.client.generateInvite();
    message.reply(
      new MessageEmbed()
        .setColor( '#00AfFF' )
        .setDescription( `[Wanna invite me, to your server!](${ inviteURL })` )
        .setFooter(
          message.client.user.username,
          message.client.user.displayAvatarURL( { format: 'jpg', dynamic: true } )
        )
    );
  },
};
