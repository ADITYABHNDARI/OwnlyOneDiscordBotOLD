const { YOUTUBE_API_KEY } = require( './../../config.js' );
const { MessageEmbed } = require( 'discord.js' );
const { showOnConsole } = require( './../Utilities.js' );
const MusicPlayer = require( './../classes/MusicPlayer.js' );
// const ReactionButton = require( './../classes/ReactionButton.js' );

const YouTube = require( 'discord-youtube-api' );
const youtube = new YouTube( YOUTUBE_API_KEY );

class Song {
  constructor( { title, url, length, thumbnail }, addedBy ) {
    this.title = title;
    this.url = url;
    this.length = length;
    this.thumbnail = thumbnail;
    this.addedBy = addedBy;
  }
  setEmbed ( embed ) {
    return embed.setTitle( this.title ).setURL( this.url ).setThumbnail( this.thumbnail );
  }
}

module.exports = {
  config: {
    name: 'play',
    aliases: ['p'],
    permissions: ['CONNECT', 'SPEAK'],
    description: 'Starts playing a song from YouTube.',
    usage: '<song-name> | <song-number-in-queue>',
    args: true,
    cooldown: 4,
    category: 'music',
  },
  async execute ( message, args ) {
    const voiceChannel = message.member.voice.channel;
    if ( !voiceChannel ) {
      return message.reply( 'Lol! You forgot to join a Voice Channel.' );
    } else if ( message.guild.voiceConnection ) {
      return message.reply( "I'm already being used in a Voice Channel!" );
    }

    const searchSong = query =>
      new Promise( ( resolve, reject ) => {
        youtube
          .searchVideos( `${ query }, music` )
          .then( video => {
            resolve( new Song( video, message.member ) );
            message.delete();
          } )
          .catch( reject );
      } );
    let player = message.client.SERVERS.get( message.guild.id );

    if ( player ) {
      if ( !isNaN( args[0] ) ) {
        player.currentSongIndex = args[0] - 2;
        player.next( 1 );
      } else {
        searchSong( args.join( ' ' ) )
          .then( song => player.addSong( song ) )
          .catch( err => showOnConsole( 'Searching Error:', err ) );
      }
      return;
    }

    console.log( 'Joinable: ', voiceChannel.joinable, "\nSpeakable: ", voiceChannel.speakable );

    player = new MusicPlayer( message );
    await player.start();

    if ( voiceChannel.speakable ) {
      searchSong( args.join( ' ' ) )
        .then( song => player.addSong( song ) )
        .catch( err => showOnConsole( 'Searching Error:', err ) );
    } else {
      return player.textChannel.send( `**${ message.member.displayName }**, It seems like I don't have permission to SPEAK in this Voice Channel!` );
    }


    // player.voiceConnection.on( 'debug', message => showOnConsole( 'Connection Debug Information:\n' + message ) );

    message.client.SERVERS.set( message.guild.id, player );
  },
};