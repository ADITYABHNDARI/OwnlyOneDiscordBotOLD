const { createCanvas, loadImage } = require('canvas');
const { MessageEmbed, MessageAttachment } = require('discord.js');

const mgc = 3;
const react = {
  positive: '👍',
  negative: '👎'
}
const box = {
  padding: 15,
  cellSize: 100
};
const cw = box.padding * 2 + box.cellSize * 3, ch = cw;
// const canvas = createCanvas(cw, ch);
// const pen = canvas.getContext('2d');

class TicTacToe {
  constructor(me, opponent, embed) {
    this.arena = Array(9).fill(0);
    this.current = null;
    this.board = createCanvas(cw, ch);
    this.pen = this.board.getContext('2d');
    this.pen.strokeStyle = "#334";
    this.pen.fillStyle = 'white';
    this.pen.fillRect(0, 0, cw, ch);
    this.pen.lineCap = 'round';

    this.me = me;
    this.opponent = opponent;
    this.boardEmbed = embed;
    this.drawBoard();
  }

  drawBoard () {
    this.pen.lineWidth = 3;
    for (let x = box.padding; x < cw - box.cellSize * 2;) {
      x += box.cellSize;
      this.pen.moveTo(x, box.padding);
      this.pen.lineTo(x, ch - box.padding);

      this.pen.moveTo(box.padding, x);
      this.pen.lineTo(ch - box.padding, x);
    }
    this.pen.stroke();
  }

  placeMark (mark, cell) {
    const markSize = box.cellSize / 4;
    const position = [cell % 3, (cell / 3 | 0)].map(axis => (axis + 0.5) * box.cellSize + box.padding);
    this.pen.beginPath();
    this.pen.lineWidth = 8;
    if (mark == 'cross') {
      this.pen.moveTo(position[0] - markSize, position[1] - markSize);
      this.pen.lineTo(position[0] + markSize, position[1] + markSize);

      this.pen.moveTo(position[0] + markSize, position[1] - markSize);
      this.pen.lineTo(position[0] - markSize, position[1] + markSize);
    } else {
      this.pen.arc(...position, markSize, 0, Math.PI * 2);
      // pen.closePath();
    }
    this.pen.stroke();

    // this.boardEmbed.edit(this.boardEmbed.embeds[0].setImage(canvas.toBuffer()));
  }

  isGameEnded (cell) {
    for (let i = (cell / mgc | 0) * mgc, len = i + mgc; i < len; i++) {
      if (this.current == arena[i]) {

      }
    }
  }
}

module.exports = {
  config: {
    name: 'tictactoes',
    aliases: ['ttts'],
    description: 'Let\'s you play the TicTacToe game!',
    usage: '<mention opponent>',
    disabled: true,
    args: true,
    incomplete: true,
    category: 'game'
  },

  async execute (message, args) {
    const opponent = message.mentions.users.first();
    if (!opponent) {
      return message.reply('You need to mention someone to play with!');
    }

    const challenge = await message.channel.send(`Hey ${opponent}, ${message.author} has invited you for a TicTacToe Game.`);
    challenge.react(react.positive).then(() => challenge.react(react.negative));

    new Promise((accept, decline) => {
      accept();
      challenge.awaitReactions(
        (reaction, user) => {
          if (user.bot) return false;
          if (user == opponent || user == message.author) return true;
          reaction.users.remove(user);
        },
        { max: 1, time: 60000, errors: ['time'] }
      ).then(collected => {
        const reaction = collected.first();

        if (reaction.emoji.name === react.positive) {
          accept();

        } else if (reaction.emoji.name === react.negative) {
          decline();

        }
      }).catch(collected => {
        message.channel.send('you reacted with neither a thumbs up, nor a thumbs down.');
      });

    }).then(async () => {
      const embed = await message.channel.send(`${opponent} accepted the challenge!`);
      embed.react('1️⃣');
      const ttt = new TicTacToe(message.author, opponent, embed);
      ttt.placeMark('cross', 2);
      let bfr = cloneCanvas(ttt.board).toBuffer();
      const emb = new MessageEmbed()
        .setTitle('TicTacToe')
        .attachFiles(bfr)
        .setImage('attachment://file.jpg');
      const tmp = await message.channel.send(emb);


      bfr = null;
      setTimeout(() => {

        ttt.placeMark('nought', 5);
        bfr = cloneCanvas(ttt.board).toBuffer();
        const emb = new MessageEmbed()
          .setTitle('TicTacToe')
          .attachFiles(bfr)
          .setImage('attachment://file.jpg');
        // tmp.suppressEmbeds();
        // setTimeout(() => tmp.suppressEmbeds(false), 3000);
        // return;
        const file = new MessageAttachment(cloneCanvas(ttt.board).toBuffer(), 'newfile.jpg');
        const nemb = {
          title: 'Some title',
          image: {
            url: 'attachment://newfile.jpg',
          },
        };
        // emb.files = [];
        // emb.files[0] = cloneCanvas(ttt.board).toBuffer();
        tmp.edit(emb
          /* new MessageEmbed()
            .setTitle('updated TicTacToe')
            // .attachFiles(cloneCanvas(ttt.board).toBuffer())
            .setImage('attachment://file.jpg') */
        );

        /*  message.channel.send(new MessageEmbed()
           .setTitle('updated TicTacToe')
           .attachFiles(cloneCanvas(ttt.board).toBuffer())
           .setImage('attachment://file.jpg')
         ); */
        // emb.attachFiles(cloneCanvas(ttt.board).toBuffer());
        console.log(emb);
      }, 3000);

    }).catch(err => {
      message.channel.send(`${opponent} declined the challenge!`);
      console.error(err);
    }).finally(() => {

    })
  }

};


function cloneCanvas (oldCanvas) {
  let newCanvas = createCanvas(oldCanvas.width, oldCanvas.height);
  let context = newCanvas.getContext('2d');

  // newCanvas.width = oldCanvas.width;
  // newCanvas.height = oldCanvas.height;

  context.drawImage(oldCanvas, 0, 0);

  return newCanvas;
}