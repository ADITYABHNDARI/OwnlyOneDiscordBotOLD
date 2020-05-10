const { MessageEmbed, MessageAttachment } = require( 'discord.js' );
const ReactionButton = require( './../classes/ReactionButton.js' );
const { emojies } = require( './../Utilities.js' );

const SIZE = 3;

class Mark {
  constructor( symbol, value ) {
    this.symbol = symbol;
    this.value = value;
  }
}

const PANE = emojies.pane, CROSS = emojies.cross, NOUGHT = emojies.nought;

class TicTacToe {
  constructor( me, opponent, embedMessage ) {
    this.moves = 0;
    this.arena = Array( SIZE * SIZE ).fill( PANE );
    this.embed = new MessageEmbed()
      .setTitle( 'TicTacToe' )
      .setDescription( `${ me.username } v/s ${ opponent.username }` );
    this.embedMessage = embedMessage;
    this.reactionController = null;

    if ( Math.random() < 0.5 ) {
      [ me.mark, opponent.mark ] = [ CROSS, NOUGHT ];
      this.active = me;
    } else {
      [ me.mark, opponent.mark ] = [ NOUGHT, CROSS ];
      this.active = opponent;
    }
    this.me = me;
    this.opponent = opponent;
    this.drawBoard();
    this.embedMessage.edit( this.embed.setFooter( `**${ this.active.username }** Won the toss!` ) );
  }

  drawBoard () {
    this.embed.spliceFields( 0, 1, {
      name: '\u200b',
      value: toString( this.arena ),
    } );
  }

  placeMark ( at ) {
    this.moves++;
    this.arena[ at ] = this.active.mark;
    this.drawBoard();
    if ( this.moves < 5 );
    else if ( this.checkWin( at ) ) {
      this.embedMessage.channel.send( `Aah! Good one **${ this.active.username }**, you WON.` );
      return this.terminate( `${ this.active.username } Wins!` );
    } else if ( this.moves > 8 ) {
      return this.terminate( 'Game Drawn!' );
    }
    this.nextTurn();
  }

  nextTurn () {
    this.active = this.active == this.me ? this.opponent : this.me;
    this.embedMessage.edit( this.embed.setFooter( `${ this.active.username }'s turn` ) );
  }

  checkWin ( index ) {
    const hori = Math.floor( index / SIZE ) * SIZE;
    return (
      this.loopThrough( hori, hori + SIZE, 1 ) || // Horizontally
      this.loopThrough( index % SIZE, SIZE * SIZE, SIZE ) || // Vertically
      this.loopThrough( 0, SIZE * SIZE, SIZE + 1 ) || // Left Slope
      this.loopThrough( SIZE - 1, SIZE * SIZE - SIZE + 1, SIZE - 1 ) // Right Slope
      // diagnols()
    );
  }
  terminate ( reason ) {
    this.embedMessage.reactions.removeAll();
    this.reactionController.collector.stop();
    this.embedMessage.edit( this.embed.setFooter( reason ) );
  }

  /**
   * @private
   */
  loopThrough ( init, range, update ) {
    while ( this.arena[ init ] == this.active.mark && init < range ) init += update;

    return init >= range;
  }
}

module.exports = {
  config: {
    name: 'tictactoe',
    aliases: [ 'ttt' ],
    description: "Let's you play the TicTacToe game!",
    usage: '<@opponent>',
    args: true,
    // incomplete: true,
    category: 'game',
  },

  async execute ( message, args ) {
    const opponent = message.mentions.users.first();
    if ( !opponent ) {
      return message.reply( 'You need to mention someone to play with!' );
    }

    message.channel
      .send( `Hey **${ opponent.username }**, do you accept the TicTacToe challenge?` )
      .then( challenge => {
        // challengeAccepted( message, opponent ); // temporary
        const awaitFilter = ( reaction, user ) => {
          if ( user == opponent ) return true;
          !user.bot && reaction.users.remove( user );
        };

        challenge.react( emojies.thumbup ).then( () => challenge.react( emojies.thumbdown ) );
        challenge
          .awaitReactions( awaitFilter, { max: 1, time: 60000 } )
          .then( collected => {
            const reaction = collected.first();
            if ( reaction.emoji.name === emojies.thumbup ) {
              challengeAccepted( message, opponent );
            } else if ( reaction.emoji.name === emojies.thumbdown ) {
              message.channel.send( `**${ opponent.username }** declined the challenge!` );
            }
          } )
          .catch( collected => {
            message.channel.send( `**${ opponent.username }** didn't responded, so the game is aborted!` );
          } );
      } );
  },
};

async function challengeAccepted ( message, opponent ) {
  const embedMessage = await message.channel.send( `**${ opponent.username }** accepted the challenge!` );

  const ticTacToe = new TicTacToe( message.author, opponent, embedMessage );
  ticTacToe.reactionController = new ReactionButton( embedMessage, getEmojies( ticTacToe ),
    ( reaction, user ) => {
      // return true;
      if ( user.id == ticTacToe.active.id ) {
        reaction.remove();
        return true;
      }
    }
  );
}

function getEmojies ( ticTacToe ) {
  const set = new Map();
  for ( let i = 0; i < SIZE * SIZE; i++ )
    set.set( emojies[ i + 1 ], () => ticTacToe.placeMark( i ) );
  return set;
}

function toString ( arena ) {
  let str = '';
  for ( let i = 0, s = 0; i < SIZE; i++ ) {
    for ( let j = 0; j < SIZE; j++ ) {
      str += arena[ s++ ];
    }
    str += '\n';
  }

  return str;
}
