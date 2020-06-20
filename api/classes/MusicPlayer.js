const { showOnConsole } = require( './../Utilities.js' );
const ytdl = require( 'ytdl-core-discord' );
const { MessageEmbed } = require( 'discord.js' );
const ReactionButton = require( './../classes/ReactionButton.js' );

const COLOR = {
  PAUSE: '#ffff00',
  PLAYING: '#00ff00',
  STOPPED: '#ff2222'
};

const BITRATE = 64, VOLUME = 1;

class MusicPlayer {
  constructor( message ) {
    this.currentSongIndex = -1;
    this.hasSkipped = false;
    this.playlist = [];
    this.isStopped = true;
    this.repeatMode = 'OFF';
    this.dispatcher = null;
    this.status = null;

    this.embed = new MessageEmbed().setColor( COLOR.PLAYING ).setTitle( 'Loading...' );
    this.serverID = message.guild.id;
    this.textChannel = message.channel;
    this.voiceChannel = message.member.voice.channel;
  }

  start () {
    return new Promise( ( resolve, reject ) => {
      this.voiceChannel.join()
        .then( async connection => {
          this.voiceConnection = connection;
          connection.on( 'disconnect', () => this.destroy() );
          connection.on( 'reconnecting', () => console.log( 'Im vc reconnetn' ) );
          this.DJ = await this.textChannel.send( this.embed );
          this.reactionController = new ReactionButton( this.DJ, getEmojies( this ),
            ( reaction, user ) => this.voiceChannel.members.has( user.id )
          );
          resolve();
        } )
        .catch( err => {
          this.textChannel.send( `**${ 'message.member.displayName' }**, I don't have permission to Join that Voice Channel!` );
        } );
    } );
  }

  getBitrate () {
    const vcBitrate = this.voiceChannel.bitrate;
    return vcBitrate < BITRATE ? vcBitrate : BITRATE;
  }

  get queueList () {
    const list = this.playlist.map( ( song, i ) => `${ i + 1 }.  ${ song.title }` );
    list[this.currentSongIndex] = `**${ list[this.currentSongIndex] }**`;
    return list.join( '\n' );
  }
  get isPaused () {
    return this.dispatcher.paused;
  }
  get isQueueEmpty () {
    return !this.playlist.length;
  }
  get username () {
    const memberName = this.voiceChannel.members.get( this.reactionController.user.id ).displayName;
    // return  ? this.reactionController.user.username : '';
    return memberName;
  }
  get currentPlaybackPosition () {
    return Math.round( this.dispatcher.streamTime / 1000 );
  }

  /**
   * @private method
   * @returns Object
   */
  getNextSong () {
    if ( this.hasSkipped || this.repeatMode != 'ONE' ) {
      this.hasSkipped = false;
      this.currentSongIndex++;
    }

    if ( this.currentSongIndex >= this.playlist.length ) {
      this.currentSongIndex = 0;
      if ( this.repeatMode == 'OFF' ) return;
    } else if ( this.currentSongIndex < 0 ) {
      this.currentSongIndex = this.playlist.length - 1;
    }

    return this.playlist[this.currentSongIndex];
  }

  log ( log ) {
    this.DJ.edit( this.embed.setAuthor( log ) );
  }
  playbackLog ( event ) {
    this.log( `${ event } by "${ this.username }"` );
  }

  addSong ( song ) {
    this.playlist.push( song );
    if ( this.isStopped ) {
      this.currentSongIndex++;
      this.play( song );
    }
    this.embed.setAuthor( `${ song.addedBy.displayName } added a new Song!` );
    this.showQueue();
  }

  /**
   * Plays the song!
   * @param {Object} song - An object having song information
  */
  async play ( song ) {
    if ( !song ) {
      this.embed.setColor( COLOR.PAUSE );
      return this.log( 'Queue finished!' );
    }

    const stream = await ytdl( song.url, { highWaterMark: 1 << 25, bitrate: this.getBitrate() } );
    this.dispatcher = this.voiceConnection
      .play( stream, { type: 'opus', fec: true, volume: false/* , highWaterMark: 1 << 16 */ } )
      .on( 'start', () => {
        this.isStopped = false;
        this.status = 'PLAYING';
        this.embed.setColor( COLOR.PLAYING );
      } )
      .on( 'finish', () => {
        this.status = 'STOPPED';
        if ( !this.isStopped ) {
          this.isStopped = true;
          this.play( this.getNextSong() );
        }
      } )
      .on( 'debug', info => showOnConsole( 'Dispatcher Info:', info, 'info' ) )
      .on( 'error', err => showOnConsole( 'Dispatcher Error:', err, 'error' ) );

    this.dispatcher.setVolumeLogarithmic( VOLUME );
    // this.dispatcher.setFEC(true);
    this.DJ.edit( song.setEmbed( this.embed ).setFooter( `Added By: ${ song.addedBy.displayName } | Repeat: ${ this.repeatMode } | Duration: ${ song.length }`, song.addedBy.user.displayAvatarURL( { format: 'jpg', dynamic: true } ) ) );
  }

  toggleRepeat () {
    const modes = ['OFF', 'ONE', 'ALL', 'OFF'];
    this.repeatMode = modes[modes.indexOf( this.repeatMode ) + 1];
    const str = this.embed.footer.text.split( ' | ' );
    str[1] = str[1].slice( 0, -3 ) + this.repeatMode;
    this.embed.setFooter( str.join( ' | ' ), this.embed.footer.iconURL );
    this.playbackLog( 'Repeat Mode changed' );
  }

  previous () {
    this.currentSongIndex -= 2;
    this.next();
    // this.dispatcher.end();
    // this.playbackLog('Skipped');
  }

  rewind () {
    this.dispatcher.seek();
  }

  pauseResume () {
    this[this.isPaused ? 'resume' : 'pause']();
  }

  pause () {
    let temp = '';
    if ( this.isStopped ) {
      this.embed.setColor( COLOR.PLAYING );
      this.play( this.playlist[this.currentSongIndex] );
      temp = 'Replaying';
      this.status = 'PLAYING';
    } else {
      temp = 'Paused';
      this.dispatcher.pause();
      this.embed.setColor( COLOR.PAUSE );
      this.status = 'PAUSED';
    }
    // console.log('Paused at :', this.dispatcher.streamTime);
    this.playbackLog( temp );
  }

  resume () {
    this.status = 'PLAYING';
    this.dispatcher.resume();
    this.embed.setColor( COLOR.PLAYING );
    this.playbackLog( 'Resumed' );
  }

  fastForward () {

  }

  next ( v = 0 ) {
    this.hasSkipped = true;
    if ( this.isStopped ) {
      this.currentSongIndex += v;
      this.play( this.playlist[this.currentSongIndex] );
    } else {
      this.dispatcher.end();
    }
    this.playbackLog( 'Skipped' );
  }

  stop () {
    this.playlist = [];
    this.isStopped = true;
    this.dispatcher.end();
    this.embed.setColor( COLOR.STOPPED );
    this.playbackLog( 'Stopped' );
  }

  destroy () {
    this.stop();
    this.reactionController.collector.stop();
    this.DJ.reactions.removeAll();
    this.DJ.client.SERVERS.delete( this.serverID );
    setTimeout( () => this.DJ.delete(), 60000 );
  }

  showQueue () {
    const newEmbed = new MessageEmbed( this.embed ).setDescription( this.queueList );
    this.DJ.edit( newEmbed );
    setTimeout( () => this.DJ.edit( this.embed ), 10000 );
  }

  /** 
   * @param {Number} songIndex - The index of song to be removed from the Queue
  */
  removeSong ( songIndex = this.currentSongIndex ) {
    const removedSong = this.playlist.splice( songIndex, 1 )[0];
    if ( !removedSong ) return;
    this.dispatcher.end();
    this.log( `${ this.username } removed ${ removedSong.title.slice( 0, 32 ) }` );
    this.currentSongIndex--;
  }
}

module.exports = MusicPlayer;

function getEmojies ( player ) {
  return new Map()
    .set( '🇶', () => player.showQueue() )
    .set( '🔁', () => player.toggleRepeat() )
    .set( '⏮️', () => player.previous() )
    .set( '⏯️', () => player.pauseResume() )
    .set( '⏭️', () => player.next() )
    .set( '🗑️', () => player.removeSong() )
    .set( '🛑', () => player.stop() );
}