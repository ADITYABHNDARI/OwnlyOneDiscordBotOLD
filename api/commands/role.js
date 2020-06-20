
const methods = new Map()
  .set( 'add', ( role, members ) => {
    members.each( async member => member.addRole( role ) );
  } )
  .set( 'remove', ( role, members ) => {
    members.each( async member => member.removeRole( role ) );
  } )
  .set( 'create', role => {

  } )
  .set( 'delete', role => {

  } )
  .set( 'modify', role => {

  } )
  .set( '_', role => {

  } );

module.exports = {
  config: {
    name: 'role',
    // aliases: ['c', 'talk'],
    description: 'helps to modify roles',
    // cooldown: 10,
    // incomplete: true,
    category: 'moderation'
  },
  execute ( message, args ) {
    const errorLog = logMessage => message.channel.send( `**${ message.member.displayName }**, ${ logMessage }` );
    console.log( message.flags );
    const methodToRun = methods.get( args[0].slice( 1 ) );
    if ( !methodToRun ) return errorLog( 'you\'ve given an invalid flag!' );

    const members = message.mentions.users;
    const roleName = args.slice( 1, -members.size() ).join( ' ' );
    const role = message.guild.roles.find( role => role.name == roleName );
    if ( !role ) return errorLog( 'I don\'t find that role on this server.' );

    methodToRun( role, members );

  }
};