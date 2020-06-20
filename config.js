if ( process.env.NODE_ENV == 'development' )
  require( 'dotenv' ).config( { path: './private/.env' } );

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_PREFIX: process.env.BOT_PREFIX,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  OWNER_ID: process.env.OWNER_ID
};