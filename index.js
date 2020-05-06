require('dotenv').config();
const bot = require('./ownly_one.js');

bot.login(process.env.BOT_TOKEN);
