/* 

Check Permission


chand sifarish
pehli nazar me
tenu leke mai jawanga
badal me paon hai
kal ho naa ho
tauba
sach kehe raha deawana
*/

const { showOnConsole } = require('./../Utilities.js');
const MusicPlayer = require('./../classes/MusicPlayer.js');
const ReactionButton = require('./../classes/ReactionButton.js');
const { youtubeAPIKey } = require('./../config.json');

const YouTube = require("discord-youtube-api");
const youtube = new YouTube(youtubeAPIKey);

const musicEmoji = {
  play: '▶️',
  pause: '⏸️',
  stop: '🛑',
  // stop: '⏹️',
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
  notes: '🎶',
  remove: '🗑️'
}

class Song {
  constructor({ title, url, length, thumbnail }, addedBy) {
    this.title = title;
    this.url = url;
    this.duration = length;
    this.thumbnail = thumbnail;
    this.addedBy = addedBy;
  }
  setEmbed (embed) {
    return embed
      // .setFooter(`Added By: ${this.addedBy.username} | Repeat: ${repeat} | Duration: ${this.duration}`, this.addedBy.displayAvatarURL({ format: "png", dynamic: true }))
      .setTitle(this.title)
      .setURL(this.url)
      .setThumbnail(this.thumbnail)
      .setAuthor('🎵 Now Playing...')
    // .setImage(song.thumbnail)
  }
}

module.exports = {
  config: {
    name: 'playnew',
    aliases: ['pnew'],
    description: 'Starts playing a song from YouTube.',
    usage: '<song-name>',
    args: true,
    cooldown: 4,
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
      const searchedVideo = await youtube.searchVideos(`${args.join(' ')}, music`);
      var song = new Song(searchedVideo, message.author);
    } catch (error) {
      showOnConsole('Searching:', error, 'error');
    }

    let player = message.client.SERVERS.get(message.guild.id);

    if (!player) {
      player = new MusicPlayer(message.guild.id, message.channel, voiceChannel);

      try {
        player.voiceConnection = await voiceChannel.join();
        player.DJ = await player.textChannel.send(player.embed.setTitle('Starting!'));
      } catch (err) {
        showOnConsole('VC Join:', err, 'error');
        // SERVERS.delete(message.guild.id);
        return message.channel.send(err);
      }

      message.client.SERVERS.set(message.guild.id, player);

      player.voiceConnection.on('disconnect', () => {
        player.close();
        // player.log('The queue has been deleted!');
      });

      // player.playlist.push(song);
      player.addSong(song);
      const emojies = new Map()
        .set('🇶', () => player.showQueue())
        .set('🔁', () => player.toggleRepeat())
        .set('⏮️', () => player.previous())
        .set('⏯️', () => player.pauseResume())
        .set('⏭️', () => player.next())
        .set('🗑️', () => player.removeSong())
        .set('🛑', () => player.close());

      player.reactionController = new ReactionButton(player.DJ, emojies, () => true);
      // console.log(player);
    } else {
      player.addSong(song);
      message.delete();
      player.log(`${message.author.username} added a new Song!`);
    }
  }
};