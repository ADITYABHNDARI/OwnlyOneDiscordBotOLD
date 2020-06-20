const { BOT_TOKEN } = require( './config.js' );
const fs = require( 'fs' );
const fetch = require( 'node-fetch' );
const { Client, Collection, MessageEmbed } = require( 'discord.js' );

const bot = new Client();
bot.commands = new Collection();
bot.SERVERS = new Collection();

/* const firebase = require( 'firebase/app' );
const admin = require( 'firebase-admin' );
const FieldValue = admin.firestore.FieldValue;
const serviceAccount = require( './ownly-one-private-key.json' );

admin.initializeApp( {
  credential: admin.credential.cert( serviceAccount )
} );
bot.database = admin.firestore(); */

// Loading Bot Commands
fs.readdir( './api/commands', ( err, files ) => {
  if ( err ) return console.error;
  for ( const file of files ) {
    if ( !file.endsWith( '.js' ) ) return;
    const command = require( `./api/commands/${ file }` );
    if ( command.config.incomplete ) continue;
    bot.commands.set( command.config.name, command );
  }
} );

// Loading Bot Events
fs.readdir( './api/events', ( err, files ) => {
  if ( err ) return console.error;
  for ( const file of files ) {
    if ( !file.endsWith( '.js' ) ) return;
    const event = require( `./api/events/${ file }` );
    bot.on( file.slice( 0, -3 ), event.bind( bot ) );
  }
} );

bot.once( 'ready', () => {
  console.log( "\nI'm Online!\n--------------------------------\n" );
  // bot.user.emoji('😝');
  bot.user.setActivity( 'for Crashments!', { type: 'WATCHING' } ).catch( console.error );

  setInterval( postMeme, 1500000 ); // 25 mins
} );

process.on( 'unhandledRejection', error => console.error( 'Uncaught Promise Rejection', error ) );

bot.login( BOT_TOKEN );

function postMeme () {
  // const memeChannel = member.guild.channels.cache.find( channel => channel.topic && channel.topic.startsWith( 'Ownly_One_Memes' ) );
  const memeChannels = bot.channels.cache.filter( channel => channel.topic && channel.topic.startsWith( 'Ownly_One_Memes' ) );

  for ( const channel of [...memeChannels.values()] ) {
    bot.commands.get( 'meme' ).execute( { channel } );
  }
}