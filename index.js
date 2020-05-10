require( 'dotenv/config' );
const fs = require( 'fs' );
const { Client, Collection } = require( 'discord.js' );

const bot = new Client();
bot.commands = new Collection();
bot.SERVERS = new Collection();




// Loading Bot Commands
fs.readdir( './commands', ( err, files ) => {
  if ( err ) return console.error;
  for ( const file of files ) {
    if ( !file.endsWith( '.js' ) ) return;
    const command = require( `./commands/${ file }` );
    if ( command.config.incomplete ) continue;
    bot.commands.set( command.config.name, command );
  }
} );

// Loading Bot Events
fs.readdir( './events', ( err, files ) => {
  if ( err ) return console.error;
  for ( const file of files ) {
    if ( !file.endsWith( '.js' ) ) return;
    const event = require( `./events/${ file }` );
    bot.on( file.slice( 0, -3 ), event.bind( bot ) );
  }
} );

bot.once( 'ready', () => {
  console.log( "\n\nI'm Online!" );
  // bot.user.emoji('😝');
  bot.user.setActivity( 'for you!', { type: 'WATCHING' } ).catch( console.error );
} );
bot.once( 'reconnecting', () => {
  console.log( "I'm Reconnecting!" );
} );

process.on( 'unhandledRejection', error => console.error( 'Uncaught Promise Rejection', error ) );

bot.login( process.env.BOT_TOKEN );
