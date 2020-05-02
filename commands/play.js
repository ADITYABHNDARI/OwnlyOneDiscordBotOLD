
/**
 * Check Permission
 * @param
 * tum mile
 * excuse me too plz
 * mai agar kahu
 * mai hu na
 * meri duniya
 * mere hath mei
 * chand sifarish
 * pehli nazar me
 * tenu leke mai jawanga
 * badal me paon hai
 * kal ho naa ho
 * tauba
 * sach kehe raha deawana
*/
() => 0;
const { showOnConsole } = require('./../Utilities.js');
const MusicPlayer = require('./../classes/MusicPlayer.js');
const ReactionButton = require('./../classes/ReactionButton.js');
const { youtubeAPIKey } = require('./../config.json');

const YouTube = require("discord-youtube-api");
const youtube = new YouTube(youtubeAPIKey);

/*#region <REGION NAME>

< You can put any type of code in here - some lines of code, functions or single or multi - line comments.
#endregion*/

class Song {
  constructor({ title, url, length, thumbnail }, addedBy) {
    this.title = title;
    this.url = url;
    this.duration = length;
    this.thumbnail = thumbnail;
    this.addedBy = addedBy;
    this.stream = null;
  }
  setEmbed (embed) {
    return embed
      // .setFooter(`Added By: ${this.addedBy.username} | Repeat: ${repeat} | Duration: ${this.duration}`, this.addedBy.displayAvatarURL({ format: "png", dynamic: true }))
      .setTitle(this.title)
      .setURL(this.url)
      .setThumbnail(this.thumbnail)
    // .setAuthor('🎵 Now Playing...')
    // .setImage(song.thumbnail)
  }
}

module.exports = {
  config: {
    name: 'play',
    aliases: ['p'],
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
    message.delete();

    let player = message.client.SERVERS.get(message.guild.id);

    if (player) return player.addSong(song);

    player = new MusicPlayer(message.guild.id, message.channel, voiceChannel);

    try {
      player.voiceConnection = await voiceChannel.join();
      player.DJ = await player.textChannel.send(player.embed.setTitle('Starting!'));
    } catch (err) {
      showOnConsole('VC Join:', err, 'error');
      return message.channel.send(err);
    }

    message.client.SERVERS.set(message.guild.id, player);

    player.voiceConnection.on('disconnect', () => {
      player.close();
      // player.log('The queue has been deleted!');
    });

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
  }
};