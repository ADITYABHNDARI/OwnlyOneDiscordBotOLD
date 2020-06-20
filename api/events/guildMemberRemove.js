module.exports = async member => {
  const goodbyeChannel = member.guild.channelCache.find( channel => channel.topic && channel.topic.startsWith( 'Ownly_One_Goodbye' ) );
  if ( !goodbyeChannel ) return;


  goodbyeChannel.send( `Goodbye ${ member }!` );
};