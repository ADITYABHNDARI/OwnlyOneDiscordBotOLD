module.exports = guild => {
  guild.client.database.collection( 'guilds' ).doc( guild.id ).set( {
    "guild_id": guild.id,
    "guild_owner": guild.owner.user.id,
    "guild_prefix": ':',
  } );
};