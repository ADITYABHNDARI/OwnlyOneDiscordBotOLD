const { MessageEmbed, MessageAttachment } = require('discord.js');

const MGC = 3;
const react = {
  positive: '👍',
  negative: '👎',
  nums: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
}

class Mark {
  constructor(symbol, value) {
    this.symbol = symbol;
    this.value = value;
  }
}

const pane = new Mark('⬛', 0);
const cross = new Mark('❌', 1);
const nought = new Mark('⭕', 2);

class TicTacToe {
  constructor(me, opponent, embedMessage) {
    this.arena = Array(MGC * MGC).fill(pane);
    this.active = cross;

    this.me = me;
    this.opponent = opponent;
    this.embedMessage = embedMessage;

    this.drawBoard();
  }

  drawBoard () {
    let edited = this.embedMessage.embeds[0].spliceFields(0, 1, {
      name: '\u200b', value: this.toString()
    });

    this.embedMessage.edit(edited);
  }

  toString () {
    let str = '';
    for (let i = 0, s = 0; i < MGC; i++) {
      for (let j = 0; j < MGC; j++) {
        str += this.arena[s++].symbol;
      }
      str += '\n';
    }

    return str;
  }

  placeMark (at) {
    this.arena[at] = this.active;
  }

  nextTurn () {
    this.active = this.active == cross ? nought : cross;
  }
}

class ReactionController {
  constructor() {

  }
}

module.exports = {
  config: {
    name: 'tictactoe',
    aliases: ['ttt'],
    description: 'Let\'s you play the TicTacToe game!',
    usage: '<mention opponent>',
    args: true,
    category: 'game'
  },

  async execute (message, args) {
    const opponent = message.mentions.users.first();
    if (!opponent) {
      return message.reply('You need to mention someone to play with!');
    }

    const challenge = await message.channel.send(`Hey ${opponent}, ${message.author} has invited you for a TicTacToe Game.`);
    challenge.react(react.positive).then(() => challenge.react(react.negative));

    const awaitFilter = (reaction, user) => {
      if (user.bot) return false;
      if (user == opponent || user == message.author) return true;
      reaction.users.remove(user);
    };

    new Promise((accept, decline) => {
      challenge.awaitReactions(awaitFilter, { max: 1, time: 60000 })
        .then(collected => {
          const reaction = collected.first();
          accept();
          if (reaction.emoji.name === react.positive) {
            accept();
          } else if (reaction.emoji.name === react.negative) {
            decline();
          }
        }).catch(collected => {
          message.channel.send('The game is aborted!');
        });
    }).then(async () => {
      message.reply(`**${opponent.username}** has accepted your TicTacToe request!`);
      const embed = new MessageEmbed()
        .setTitle('TicTacToe')
        .addField(`field ${react.pane}\n, ${react.cross}`, `value ${react.nought}\n ${react.nought}`);
      const embedMessage = await message.channel.send(embed);
      for (let i = 0; i < MGC; i++) {
        await embedMessage.react(react.nums[i]);
      }
      const ticTacToe = new TicTacToe(message.author, opponent, embedMessage);
    }).catch(() => {
      message.reply(`**${opponent.username}** has declined your TicTacToe request!`);
    })
  }
}

function cloneCanvas (oldCanvas) {
  let newCanvas = document.createElement('canvas');
  let context = newCanvas.getContext('2d');

  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  context.drawImage(oldCanvas, 0, 0);

  return newCanvas;
}