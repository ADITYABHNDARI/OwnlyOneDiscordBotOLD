const Cooldown = require( './Cooldown.js' );

const property = {
  sequence: false,
  cooldown: 3
};

class ReactionButton {
  constructor( message, emojies, filter, options = {} ) {
    this.message = message;
    this.emojies = emojies;
    this.user = null;
    this.cooldown = new Cooldown( property.cooldown );
    this.collector = message.createReactionCollector(
      ( reaction, user ) => {
        if ( user.bot || !emojies.has( reaction.emoji.name ) ) return false;
        reaction.users.remove( user );

        return !this.cooldown.isRunning && filter( reaction, user );
      }, options
    ).on( 'collect', ( reaction, user ) => {
      this.user = user;
      this.cooldown.start();
      if ( !emojies.has( reaction.emoji.name ) ) return;
      emojies.get( reaction.emoji.name )();
      reaction.users.remove( user );
    } );
    this.reactEmoji( [ ...emojies.keys() ] );
  }

  reactEmoji ( emojies ) {
    if ( !emojies.length ) return;
    this.message.react( emojies.shift() ).then( () => this.reactEmoji( emojies ) );
  }
}

module.exports = ReactionButton;



/* "ffmpeg-static": "^4.1.0", */