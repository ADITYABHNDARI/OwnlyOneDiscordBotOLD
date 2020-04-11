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
};

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
      .setColor('#0099ff')
      .setTitle(this.title)
      .setURL(this.url)
      .setAuthor('🎵 Now Playing...')
      .setThumbnail(this.thumbnail)
      // .setImage(song.thumbnail)
      .setFooter(`Added By: ${this.addedBy.username}`, this.addedBy.displayAvatarURL({ format: "png", dynamic: true }));
  }
}
const queue = new Map();
let dispatcher;
let reactionLogger;

module.exports = {
  config: {
    name: 'playdfsd',
    aliases: ['pold', 'basant'],
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
      // const songInfo = await ytdl.getInfo(searchedVideo.url);
      const searchedVideo = await youtube.searchVideos(args.join(' '));
      var song = new Song(searchedVideo, message.author);
    } catch (error) { }

    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      const queueContruct = {
        index: 0,
        textChannel: message.channel,
        voiceChannel,
        connection: null,
        playlist: [],
        volume: 5,
        playing: false,
        repeat: false,
        nowPlaying: null,
        cooldown: {
          time: 2000,
          isRunning: false,
          start () {
            this.isRunning = true;
            setTimeout(() => this.stop(), this.time);
          },
          stop () {
            this.isRunning = false;
          }
        },
        getNextSong () {
          return this.playlist[this.index];
        },
        updateTrack (sign) {
          this.index = (this.index + sign + this.playlist.length) % this.playlist.length;
        }
      };
      queue.set(message.guild.id, queueContruct);
      queueContruct.playlist.push(song);

      try {
        queueContruct.nowPlaying = await queueContruct.textChannel.send('Starting...');
        queueContruct.connection = await voiceChannel.join();
        queueContruct.connection.on('disconnect', () => {
          stop(message, queueContruct);
          logs({ username: 'I disconnected' }, 'the playback has been deleted!')
        });
        play(message.guild, queueContruct.playlist[0]);
        reactToEmbed(queueContruct);
        reactionLogger = await queueContruct.textChannel.send('```Song Playing!```');
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      // console.log(serverQueue.songs);
      logs('added a new song to the queue!', message.author);
      message.delete();
      return;// message.channel.send(`**${song.title}** has been added to the queue!`);
    }

  }
};

function play (guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.playing = false;
    // serverQueue.voiceChannel.leave();
    // setTimeout(() => serverQueue.voiceChannel.leave(), 300000);
    return queue.delete(guild.id);
  }
  serverQueue.playing = true;

  serverQueue.nowPlaying.edit(createNowPlayingEmbed(song));

  dispatcher = serverQueue.connection
    .play(ytdl(song.url, { filter: 'audioonly' }))
    .on("finish", () => {
      // serverQueue.songs.shift();
      play(guild, serverQueue.getNextSong());
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  // serverQueue.textChannel.send(createNowPlayingEmbed(song)).then(reactToEmbed);

}

function logs (user, log) {
  reactionLogger.edit(`\`\`\`${user.username}, ${log}\`\`\``)
}

function isValidUser (reaction, user) {
  const voiceChannel = reaction.message.member.voice.channel;
  const member = voiceChannel.members.get(user.id);
  // console.log(member, user);
  if (!member) {
    logs(user, 'tried to mess with the player! 😆');
    // reaction.users.remove(user);
  }
  return !!member;
}

function reactToEmbed (serverQueue) {
  const embedMessage = serverQueue.nowPlaying;
  embedMessage.react(musicEmoji.notes)
    .then(() => embedMessage.react(musicEmoji.repeat))
    .then(() => embedMessage.react(musicEmoji.previousTrack))
    .then(() => embedMessage.react(musicEmoji.playPause))
    .then(() => embedMessage.react(musicEmoji.nextTrack))
    .then(() => embedMessage.react(musicEmoji.stop));
  // .then(() => embed.react(playerSymbol.rewind))
  // .then(() => embed.react(playerSymbol.fastForward))
  // .then(() => embed.react(playerSymbol.))

  const filter = (reaction, user) => {
    if (user.bot) return false;

    reaction.users.remove(user);
    return !serverQueue.cooldown.isRunning &&
      isValidUser(reaction, user) &&
      Object.values(musicEmoji).includes(reaction.emoji.name)
  };

  serverQueue.reactionCollector = embedMessage.createReactionCollector(filter);

  const messageReacted = (reaction, user) => {
    serverQueue.cooldown.start();
    let log = '';
    switch (reaction.emoji.name) {
      case musicEmoji.playPause:
        console.log('User wants to play-pause');
        // dispatcher[dispatcher.paused ? 'resume' : 'pause']();
        if (dispatcher.paused) {
          dispatcher.resume();
          log = 'resumes the song!';
        } else {
          dispatcher.pause();
          log = 'paused the song!';
        }
        break;

      case musicEmoji.nextTrack:
        serverQueue.updateTrack(1);
        console.log('User wants to skip');
        skip('', serverQueue);
        log = 'skips the song!'
        break;
      case musicEmoji.previousTrack:
        serverQueue.updateTrack(-1);
        console.log('User wants to skip');
        skip('', serverQueue);
        log = 'skips the song!';
        break;
      case musicEmoji.stop:
        console.log('User wants to stop');
        stop('', serverQueue);
        log = 'stops the playback!';
        break;
      case musicEmoji.repeat:
        serverQueue.repeat = !serverQueue.repeat;
        log = 'toggles the repeat mode!'
        break;
      case musicEmoji.notes:
        // console.log(serverQueue);
        log = 'wants to see the queue list!';
        break;
    }

    logs(user, log);
    // reaction.users.remove(user);
  };
  serverQueue.reactionCollector.on('collect', messageReacted);
  // reactionCollector.on('dispose', messageReacted);
  // reactionCollector.on('remove', messageReacted);
  serverQueue.reactionCollector.on('end', collected => {
    console.log(`Collected ${collected.size} items`);
    embedMessage.reactions.removeAll();
  });
}

function skip (message, serverQueue) {
  if (!serverQueue.playing) return;
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop (message, serverQueue) {
  serverQueue.reactionCollector.stop();
  if (!serverQueue.playing) return;
  // serverQueue.reactionCollector.reactions.removeAll();
  serverQueue.playing = false;
  serverQueue.songs = [];
  try {
    serverQueue.connection.dispatcher.end();
  } catch (err) {

  }
}

function createNowPlayingEmbed (song) {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('🎵 Now Playing...')
    .setThumbnail(song.thumbnail)
    // .setImage(song.thumbnail)
    .setFooter(`Added By: ${song.addedBy.username}`, song.addedBy.displayAvatarURL({ format: "png", dynamic: true }));
}