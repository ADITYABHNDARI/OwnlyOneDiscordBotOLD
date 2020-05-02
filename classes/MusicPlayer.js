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
    this.isPlaying = null;
    this.repeatMode = 'OFF';
    this.dispatcher = null;
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

  getNextSong () {
    if (this.hasSkipped) {
      this.hasSkipped = false;
    } else if (this.repeatMode == 'ONE') this.currentSongIndex--;

    if (this.currentSongIndex >= this.playlist.length) {
      this.currentSongIndex = this.repeatMode == 'ALL' ? 0 : -1;
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
    if (!this.isPlaying) {
      this.play(song);
      this.currentSongIndex++;
    }
    this.playlist.push(song);
    // this.log(${song.title.slice(0, 32)}`);
    this.embed.setAuthor(`${song.addedBy.username} added a new Song!`)
    this.showQueue();
    // this.DJ.edit(this.embed.setDescription(this.songs));
  }

  /**
   * Plays the song!
   * @param {Object} songToPlay - An object having song information
  */
  async play (songToPlay) {
    if (!songToPlay) {
      this.embed.setColor(COLOR.PAUSE);
      return this.log('Queue finished!');
    }

    if (!songToPlay.stream) {
      try {
        songToPlay.stream = await ytdl(songToPlay.url, { highWaterMark: 1 << 8, bitrate: this.getBitrate() });
      } catch (error) {
        return showOnConsole('Stream Error: ', error, 'error');
      }
    }
    this.dispatcher = null;
    this.dispatcher = this.voiceConnection
      .play(songToPlay.stream, { type: 'opus', volume: false/* , highWaterMark: 1 << 16 */ })
      .on('start', () => {
        this.isPlaying = true;
        if (this.isPaused) {
          this.resume();
        }
      })
      .on('finish', () => {
        this.isPlaying = false;
        this.currentSongIndex++;
        // setTimeout(() => this.play(this.getNextSong()), 1000);
        this.play(this.getNextSong());
        // setTimeout(() => console.log('the stream is paused: ', this.dispatcher.paused), 4000);
      })
      .on('debug', info => showOnConsole('Dispatcher Info:', info, 'info'))
      .on('error', err => showOnConsole('Dispatcher Error:', err, 'error'));

    this.dispatcher.setVolumeLogarithmic(this.volume);
    // this.dispatcher.setFEC(true);
    this.DJ.edit(songToPlay.setEmbed(this.embed).setFooter(`Added By: ${songToPlay.addedBy.username} | Repeat: ${this.repeatMode} | Duration: ${songToPlay.duration}`, songToPlay.addedBy.displayAvatarURL({ format: 'jpg', dynamic: true })));
  }

  toggleRepeat () {
    const modes = ['OFF', 'ONE', 'ALL', 'OFF'];
    this.repeatMode = modes[modes.indexOf(this.repeatMode) + 1];
    const str = this.embed.footer.text.split(' | ');
    str[1] = str[1].slice(0, -3) + this.repeatMode;
    this.DJ.edit(this.embed.setFooter(str.join(' | '), this.embed.footer.iconURL));
    this.playbackLog('Repeat Mode changed');
  }

  previous () {
    this.currentSongIndex -= 2;
    this.next();
    // this.dispatcher.end();
    // this.playbackLog('Skipped');
  }

  rewind () {

  }

  pauseResume () {
    if (!this.isPlaying) {
      this.play(this.playlist[this.currentSongIndex]);
      return;
    }
    this[this.isPaused ? 'resume' : 'pause']();
  }

  pause () {
    this.dispatcher.pause();
    // console.log('Paused at :', this.dispatcher.streamTime);
    this.embed.setColor(COLOR.PAUSE);
    this.playbackLog('Paused');
  }

  resume () {
    this.dispatcher.resume();
    this.embed.setColor(COLOR.PLAYING);
    this.playbackLog('Resumed');
  }

  fastForward () {

  }

  next () {
    this.hasSkipped = true;
    this.dispatcher.end();
    this.playbackLog('Skipped');
  }

  close () {
    this.playlist = [];
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