require('dotenv').config();
const bot = require('./ownly_one.js');

console.log(process.env.BOT_TOKEN);
const token = process.env.BOT_TOKEN || "Njk2MDYyNTM1MDA2MTU4OTI4.Xq0g0Q.jy9NymP5NgbMzo0PORWCmn4fqi4";
bot.login(token);
