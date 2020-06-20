const { createCanvas, loadImage } = require( 'canvas' );
const { MessageAttachment } = require( 'discord.js' );
const path = require( 'path' );

module.exports = async member => {
  const welcomeChannel = member.guild.channels.cache.find( channel => channel.topic && channel.topic.startsWith( 'Ownly_One_Welcome' ) );
  if ( !welcomeChannel ) return;

  const cw = 650, ch = 250;

  const canvas = createCanvas( cw, ch );
  const pen = canvas.getContext( '2d' );

  const background = await loadImage( path.join( __dirname, './../assets/images/wallpaper.png' ) );
  pen.drawImage( background, 0, 0, cw, ch );
  pen.strokeStyle = '#ffffff';
  pen.strokeRect( 0, 0, cw, ch );

  const avatar = {
    image: await loadImage( member.user.displayAvatarURL( { format: 'jpg' } ) ),
    size: 175,
    offset: 15,
    get center () {
      return this.offset + this.size / 2;
    },
  };

  pen.fillStyle = '#ffffff33';
  pen.fillRect( avatar.center * 2, avatar.size - 50, cw - avatar.center * 2 - avatar.offset, 50 + avatar.offset );

  pen.fillStyle = '#ffffff';
  pen.font = 'italic bold 30px sans-serif';
  pen.fillText( 'WELCOME TO', avatar.center * 2 + avatar.offset, avatar.offset + 30 );

  pen.font = '34px sans-serif';
  pen.fillText( member.guild.name, avatar.center * 2 + avatar.offset, avatar.center );

  pen.font = 'bold 50px sans-serif';
  pen.fillText( member.displayName, avatar.center * 2 + avatar.offset, avatar.size );

  pen.font = 'italic 30px sans-serif';
  pen.fillText( `You're the ${ member.guild.memberCount + 1 }th member!`, avatar.offset, ch - avatar.offset );


  pen.beginPath();
  pen.arc( avatar.center, avatar.center, avatar.size / 2, 0, Math.PI * 2, true );
  pen.closePath();
  pen.clip();
  pen.drawImage( avatar.image, avatar.offset, avatar.offset, avatar.size, avatar.size );

  const attachment = new MessageAttachment( canvas.toBuffer() ); // 2nd arg 'sm other img.png'
  welcomeChannel.send( `Welcome ${ member }!`, attachment );
};