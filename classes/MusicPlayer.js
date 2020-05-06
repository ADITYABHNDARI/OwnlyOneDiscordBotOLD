const { showOnConsole } = require('./../Utilities.js');
const ytdl = require('ytdl-core-discord');
const { MessageEmbed } = require('discord.js');


const COLOR = {
  PAUSE: '#ffff00',
  PLAYING: '#00ff00',
  STOPPED: '#ff2222'
}

class MusicPlayer {
  constructor(serverID, textChannel, voiceChannel) {
    this.serverID = serverID;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.voiceConnection = null;
    this.embed = new MessageEmbed().setColor(COLOR.PLAYING);
    this.volume = 1;
    this._bitrate = 64;
    this.DJ = null;
    this.reactionController = null;
    this.currentSongIndex = -1;
    this.hasSkipped = false;
    this.playlist = [];
    this.isStopped = true;
    this.repeatMode = 'OFF';
    this.dispatcher = null;
    this.status = null;
  }
  getBitrate () {
    const vcBitrate = this.voiceChannel.bitrate;
    return vcBitrate < this._bitrate ? vcBitrate : this._bitrate;
  }

  get queueList () {
    const list = this.playlist.map((song, i) => `${i + 1}.  ${song.title}`);
    list[this.currentSongIndex] = `**${list[this.currentSongIndex]}**`;
    return list.join('\n');
  }
  get isPaused () {
    return this.dispatcher.paused;
  }
  get isQueueEmpty () {
    return !this.playlist.length;
  }
  get username () {
    return this.reactionController.user ? this.reactionController.user.username : '';
  }
  get currentPlaybackPosition () {
    return Math.round(this.dispatcher.streamTime / 1000);
  }

  /**
   * @private method
   * @returns Object
   */
  getNextSong () {
    if (this.hasSkipped || this.repeatMode != 'ONE') {
      this.hasSkipped = false;
      this.currentSongIndex++;
    }

    if (this.currentSongIndex >= this.playlist.length) {
      this.currentSongIndex = 0;
      if (this.repeatMode == 'OFF') return;
    } else if (this.currentSongIndex < 0) {
      this.currentSongIndex = this.playlist.length - 1;
    }

    return this.playlist[this.currentSongIndex];
  }

  log (log) {
    this.DJ.edit(this.embed.setAuthor(log));
  }
  playbackLog (event) {
    this.log(`${event} by "${this.username}"`);
  }

  addSong (song) {
    this.playlist.push(song);
    if (this.isStopped) {
      this.currentSongIndex++;
      this.play(song);
    }
    this.embed.setAuthor(`${song.addedBy.username} added a new Song!`)
    this.showQueue();
  }

  /**
   * Plays the song!
   * @param {Object} song - An object having song information
  */
  async play (song) {
    if (!song) {
      this.embed.setColor(COLOR.PAUSE);
      return this.log('Queue finished!');
    }

    const stream = await ytdl(song.url, { highWaterMark: 1 << 25, bitrate: this.getBitrate() });
    this.dispatcher = this.voiceConnection
      .play(stream, { type: 'opus', fec: true, volume: false/* , highWaterMark: 1 << 16 */ })
      .on('start', () => {
        this.isStopped = false;
        this.status = 'PLAYING';
        this.embed.setColor(COLOR.PLAYING);
      })
      .on('finish', () => {
        this.status = 'STOPPED';
        if (!this.isStopped) {
          this.isStopped = true;
          this.play(this.getNextSong());
        }
      })
      .on('debug', info => showOnConsole('Dispatcher Info:', info, 'info'))
      .on('error', err => showOnConsole('Dispatcher Error:', err, 'error'));

    this.dispatcher.setVolumeLogarithmic(this.volume);
    // this.dispatcher.setFEC(true);
    this.DJ.edit(song.setEmbed(this.embed).setFooter(`Added By: ${song.addedBy.username} | Repeat: ${this.repeatMode} | Duration: ${song.length}`, song.addedBy.displayAvatarURL({ format: 'jpg', dynamic: true })));
  }

  toggleRepeat () {
    const modes = ['OFF', 'ONE', 'ALL', 'OFF'];
    this.repeatMode = modes[modes.indexOf(this.repeatMode) + 1];
    const str = this.embed.footer.text.split(' | ');
    str[1] = str[1].slice(0, -3) + this.repeatMode;
    this.embed.setFooter(str.join(' | '), this.embed.footer.iconURL);
    this.playbackLog('Repeat Mode changed');
  }

  previous () {
    this.currentSongIndex -= 2;
    this.next();
    // this.dispatcher.end();
    // this.playbackLog('Skipped');
  }

  rewind () {
    this.dispatcher.seek()
  }

  pauseResume () {
    this[this.isPaused ? 'resume' : 'pause']();
  }

  pause () {
    let temp = '';
    if (this.isStopped) {
      this.embed.setColor(COLOR.PLAYING);
      this.play(this.playlist[this.currentSongIndex]);
      temp = 'Replaying'
      this.status = 'PLAYING';
    } else {
      temp = 'Paused'
      this.dispatcher.pause();
      this.embed.setColor(COLOR.PAUSE);
      this.status = 'PAUSED';
    }
    // console.log('Paused at :', this.dispatcher.streamTime);
    this.playbackLog(temp);
  }

  resume () {
    this.status = 'PLAYING'
    this.dispatcher.resume();
    this.embed.setColor(COLOR.PLAYING);
    this.playbackLog('Resumed');
  }

  fastForward () {

  }

  next (v = 0) {
    this.hasSkipped = true;
    if (this.isStopped) {
      this.currentSongIndex += v;
      this.play(this.playlist[this.currentSongIndex]);
    } else {
      this.dispatcher.end();
    }
    this.playbackLog('Skipped');
  }

  close () {
    this.playlist = [];
    this.isStopped = true;
    this.dispatcher.end();
    this.reactionController.collector.stop();
    this.embed.setColor(COLOR.STOPPED);
    this.playbackLog('Stopped');
    this.DJ.client.SERVERS.delete(this.serverID);
    setTimeout(() => this.DJ.delete(), 60000);
  }

  showQueue () {
    const newEmbed = new MessageEmbed(this.embed).setDescription(this.queueList);
    this.DJ.edit(newEmbed);
    setTimeout(() => this.DJ.edit(this.embed), 10000);
  }

  /** 
   * @param {Number} songIndex - The index of song to be removed from the Queue
  */
  removeSong (songIndex = this.currentSongIndex) {
    const removedSong = this.playlist.splice(songIndex, 1)[0];
    if (!removedSong) return;
    this.dispatcher.end();
    this.log(`${this.username} removed ${removedSong.title.slice(0, 32)}`);
    this.currentSongIndex--;
  }
}

module.exports = MusicPlayer;