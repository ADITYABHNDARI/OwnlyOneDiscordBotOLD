const { BOT_PREFIX } = require( './../../config.js' );

module.exports = {
  config: {
    name: 'help',
    aliases: ['commands', 'cmd', 'h'],
    description: 'Gets list of commands available!',
    usage: '<command-name>',
    category: 'miscellaneous'
  },

  execute ( message, args ) {
    const data = [];
    const { commands } = message.client;

    if ( !args.length ) {
      data.push( 'Here\'s a list of all my commands:' );
      data.push( commands.map( command => command.config.name ).join( ', ' ) );
      data.push( `\nYou can send \`${ BOT_PREFIX }help [command name]\` to get info on a specific command!` );

      return message.author.send( data, { split: true } )
        .then( () => {
          if ( message.channel.type === 'dm' ) return;
          message.reply( 'I\'ve sent you a DM with all my commands!' );
        } )
        .catch( error => {
          console.error( `Could not send help DM to ${ message.author.tag }.\n`, error );
          message.reply( 'it seems like I can\'t DM you! Do you have DMs disabled?' );
        } );
    }

    const name = args[0].toLowerCase();
    let command = commands.get( name ) || commands.find( c => c.config.aliases && c.config.aliases.includes( name ) );

    if ( !command ) {
      return message.reply( 'that Command does not exits in my dictionary.' );
    }

    command = command.config;

    data.push( `**Name:** ${ command.name }` );

    if ( command.aliases ) data.push( `**Aliases:** ${ command.aliases.join( ', ' ) }` );
    if ( command.description ) data.push( `**Description:** ${ command.description }` );
    if ( command.usage ) data.push( `**Usage:** \`${ BOT_PREFIX }${ command.name } ${ command.usage }\`` );

    data.push( `**Cooldown:** ${ command.cooldown || 3 } second(s)` );

    message.channel.send( data, { split: true } );
  }
};