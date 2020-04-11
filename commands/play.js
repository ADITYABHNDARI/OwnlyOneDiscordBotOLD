const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');
const YouTube = require("discord-youtube-api");

const youtube = new YouTube("AIzaSyB070H-hAFt9bOlIxvL8vB3fFE_Mj1Hc5E");

const musicEmoji = {
  play: '▶️',
  pause: '⏸️',
  stop: '⏹️',
  record: '⏺️',
  playPause: '⏯️',
  previousTrack: '⏮️',
  nextTrack: '⏭️',
  rewind: '⏪',
  fastForward: '⏩',
  shuffle: '🔀',
  repeat: '🔁',
  repeatOne: '🔂',
  loop: '🔄',
  note: '🎵',
  notes: '🎶'
}

const SERVERS = new Map();

class Player {
  constructor(serverID, textChannel, voiceChannel) {
    this.serverID = serverID;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.voiceConnection = null;
    this.currentSongIndex = 0;
    this.sign = 0;
    this.playlist = [];
    this.volume = 1;
    this.isPlaying = false;
    this.toRepeat = false;
    this.embed = null;
    this.logger = null;
    this.reactionController = null;
    // this.reactionCollector = createReactionCollector();
    this.dispatcher = null;
  }

  getNextSong () {
    if (this.sign == 0) {
      if (this.toRepeat) {

      } else {
        this.currentSongIndex++;
      }
    } else {
      this.currentSongIndex += this.sign;
      this.sign = 0;
    }
    this.currentSongIndex = (this.currentSongIndex + this.playlist.length) % this.playlist.length;
    return this.playlist[this.currentSongIndex];
  }
  get username () {
    return this.reactionController.user.username;
  }

  get playbackPosition () {
    return Math.round(this.dispatcher.streamTime / 1000);
  }

  log (log) {
    this.logger.edit(`\`\`\`${log}\`\`\``);
  }
  playbackLog (event) {
    this.log(`${event}, by "${this.username}"`);
  }

  play (songToPlay) {
    if (!songToPlay) return SERVERS.delete(this.serverID);

    this.embed.edit(songToPlay.getEmbed());
    this.dispatcher = this.voiceConnection
      .play(ytdl(songToPlay.url, { filter: 'audioonly' }), { seek: 0 })
      .on('finish', () => {
        this.play(this.getNextSong());
      })
      .on('error', console.error);

    this.dispatcher.setVolumeLogarithmic(this.volume);
  }

  toggleRepeat () {
    this.toRepeat = !this.toRepeat;
    this.log(`Repeat Mode set to ${this.toRepeat ? 'ON' : 'OFF'} by ${this.username}`);
  }

  previous () {
    this.sign = -1;
    this.dispatcher.end();
    this.playbackLog('SKIPPED');
  }

  rewind () {

  }

  pauseResume () {
    if (this.dispatcher.paused) {
      this.dispatcher.resume();
      this.embed.edit(this.embed.embeds[0].setColor('#00ff00'));
      this.playbackLog('RESUMED');
    } else {
      this.dispatcher.pause();
      console.log('Paused at :', this.dispatcher.streamTime);
      this.embed.edit(this.embed.embeds[0].setColor('#ffff00'));
      this.playbackLog('PAUSED');
    }
  }

  fastForward () {

  }

  next () {
    this.sign = 1;
    this.dispatcher.end();
    this.playbackLog('SKIPPED');
  }

  stop () {
    this.reactionController.collector.stop();
    this.playlist = [];
    this.dispatcher.end();
    this.embed.edit(this.embed.embeds[0].setColor('#ff2222'));
    this.playbackLog('STOPPED');
  }
}

class Song {
  constructor({ title, url, durationSeconds, thumbnail }, addedBy) {
    this.title = title;
    this.url = url;
    this.duration = durationSeconds;
    this.thumbnail = thumbnail;
    this.addedBy = addedBy;
  }
  getEmbed () {
    return new MessageEmbed()
      .setColor('#00ff00')
      .setTitle(this.title)
      .setURL(this.url)
      .setAuthor('🎵 Now Playing...')
      .setThumbnail(this.thumbnail)
      // .setImage(song.thumbnail)
      .setFooter(`Added By: ${this.addedBy.username}`, this.addedBy.displayAvatarURL({ format: "png", dynamic: true }));
  }
}

class ReactionController {
  constructor(player) {
    this.player = player;
    this.embed = player.embed;
    this.user = null;
    this.cooldown = {
      time: 2500,
      isRunning: false,
      start () {
        clearTimeout(this.isRunning);
        this.isRunning = setTimeout(() => this.stop(), this.time);
      },
      stop () {
        this.isRunning = false;
      }
    };
    this.addReactionButtons();
    this.collector = this.embed.createReactionCollector((reaction, user) => this.filterReactions(reaction, user));
    this.collector.on('collect', (reaction, user) => this.onReaction(reaction, user));
    this.collector.on('end', () => {
      this.player.embed.reactions.removeAll();
    });
  }

  addReactionButtons () {
    // await this.embed.react(musicEmoji.notes);
    // await this.embed.react(musicEmoji.repeat);
    // await this.embed.react(musicEmoji.previousTrack);
    // await this.embed.react(musicEmoji.playPause);
    // await this.embed.react(musicEmoji.nextTrack);
    // await this.embed.react(musicEmoji.stop);

    this.embed.react(musicEmoji.notes)
      .then(() => this.embed.react(musicEmoji.repeat))
      .then(() => this.embed.react(musicEmoji.previousTrack))
      // .then(() => this.embed.react(musicEmoji.rewind))
      .then(() => this.embed.react(musicEmoji.playPause))
      // .then(() => this.embed.react(musicEmoji.fastForward))
      .then(() => this.embed.react(musicEmoji.nextTrack))
      .then(() => this.embed.react(musicEmoji.stop));
  }

  filterReactions (reaction, user) {
    if (user.bot) return false;
    reaction.users.remove(user);

    const voiceChannel = reaction.message.member.voice.channel;
    const member = voiceChannel.members.get(user.id);
    if (!member) {
      this.player.log(`${user.username} tried to mess with the player! 😆`);
      return false;
    }

    return !this.cooldown.isRunning && Object.values(musicEmoji).includes(reaction.emoji.name);
  }

  onReaction (reaction, user) {
    this.user = user;
    this.cooldown.start();
    switch (reaction.emoji.name) {
      case musicEmoji.playPause:
        this.player.pauseResume();
        break;
      case musicEmoji.nextTrack:
        this.player.next();
        break;
      case musicEmoji.previousTrack:
        this.player.previous();
        break;
      case musicEmoji.fastForward:
        this.player.fastForward();
        break;
      case musicEmoji.rewind:
        this.player.rewind();
        break;
      case musicEmoji.stop:
        this.player.stop();
        break;
      case musicEmoji.repeat:
        this.player.toggleRepeat();
        break;
      case musicEmoji.notes:
        const queueList = this.player.playlist.map((song, i) => `${i + 1}.  ${song.title}`);
        this.player.log(queueList.join('\n'));
        break;
    }
  }
}

module.exports = {
  config: {
    name: 'play',
    aliases: ['p'],
    description: 'Starts or Resumes a song.',
    cooldown: 5,
    category: 'music'
  },
  async execute (message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply('Lol! You forgot to join a Voice Channel.');
    } else if (message.guild.voiceConnection) {
      return message.reply('I\'m already in a Voice Channel!');
    }

    try {
      const searchedVideo = await youtube.searchVideos(`"${args.join(' ')}", music`);
      var song = new Song(searchedVideo, message.author);
    } catch (error) { }

    let player = SERVERS.get(message.guild.id);

    if (!player) {
      player = new Player(message.guild.id, message.channel, voiceChannel);
      player.playlist.push(song);
      SERVERS.set(message.guild.id, player);

      try {
        player.voiceConnection = await voiceChannel.join();
        player.embed = await player.textChannel.send('Starting...');
        player.logger = await player.textChannel.send('```Song Playing!```');
      } catch (err) {
        console.error(err);
        SERVERS.delete(message.guild.id);
        return message.channel.send(err);
      }

      player.voiceConnection.on('disconnect', () => {
        player.stop();
        player.log('The queue has been deleted!');
      });

      player.play(player.playlist[0]);
      player.reactionController = new ReactionController(player);
      // console.log(player);
      // player.reactionController.addReactionButtons();
    } else {
      player.playlist.push(song);
      message.delete();
      player.log(message.author.username + 'added a new song to the queue!');
    }

    return;
  }
};
