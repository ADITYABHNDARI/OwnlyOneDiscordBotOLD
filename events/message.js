const { Collection } = require( 'discord.js' );
const Cooldown = require( './../classes/Cooldown.js' );
const { prefix } = require( './../config.json' );

const cooldowns = new Collection();
const escapeRegex = str => str.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

module.exports = message => {
  const prefixRegex = new RegExp( `^(<@!?${ message.client.user.id }>|${ escapeRegex( prefix ) })\\s*` );
  if ( !prefixRegex.test( message.content ) ) return;

  const [ , matchedPrefix ] = message.content.match( prefixRegex );
  const args = message.content.slice( matchedPrefix.length ).trim().split( / +/ );
  const commandName = args.shift().toLowerCase();
  if ( commandName == 'fake' ) {
    // const member = message.mentions.users.first() || message.member.user;
    return message.client.emit( `guildMember${ args[ 0 ] == 'kick' ? 'Remove' : 'Add' }`, message.member );
  }
  const command = message.client.commands.get( commandName ) ||
    message.client.commands.find( cmd => cmd.config.aliases && cmd.config.aliases.includes( commandName ) );
  if ( !command ) return message.reply( `that command either doesn't exist or may be incorrect!` );
  else if ( command.config.disabled ) {
    return message.reply( `sorry, that command is currently take down atm` );
  } else if ( command.config.args && !args.length ) {
    return message.reply( `you didn't provide any arguments!` );
  }

  // Cooldowns
  if ( !cooldowns.has( command.config.name ) ) {
    cooldowns.set( command.config.name, new Collection() );
  }

  const timestamps = cooldowns.get( command.config.name );
  const userCooldown = timestamps.get( message.author.id );
  if ( userCooldown && userCooldown.isRunning ) {
    return message.reply(
      `please wait for few seconds before reusing the \`${ command.config.name }\` command.`
    );
  } else {
    const cooldown = new Cooldown( command.config.cooldown || 3 );
    timestamps.set( message.author.id, cooldown );
    cooldown.start();
  }

  // Execute the Command
  try {
    command.execute( message, args );
  } catch ( error ) {
    console.error( error );
    message.reply( 'there was an error trying to execute that command!' );
  }
};