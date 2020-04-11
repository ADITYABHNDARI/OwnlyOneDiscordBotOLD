const fs = require('fs');
const { memberAdd, memberLeave } = require('./guildMember/member.js');
const { Client, Collection } = require('discord.js');
const { prefix, token } = require('./config.json');

const bot = new Client();
bot.commands = new Collection();


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.config.name, command);
}

const cooldowns = new Collection();

bot.once('ready', () => {
  console.log('I\'m Online!');
  // bot.user.emoji('😝');
  bot.user.setActivity('Basant!', { type: 'LISTENING' })
    .catch(console.error);
});

bot.on('guildMemberAdd', memberAdd);
bot.on('guildMemberRemove', memberLeave);

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Temporary Code
  if (commandName == 'fake') {
    // const member = message.mentions.users.first() || message.member.user;
    return bot.emit(`guildMember${args[0] == 'kick' ? 'Remove' : 'Add'}`, message.member);
  }

  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));
  if (!command) return;

  if (command.config.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
  }

  // Cooldowns
  if (!cooldowns.has(command.config.name)) {
    cooldowns.set(command.config.name, new Collection());
  }

  const now = Date.now();
  const cooldownAmount = (command.config.cooldown || 3) * 1000;
  const timestamps = cooldowns.get(command.config.name);

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.config.name}\` command.`);
    }
  } else {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  // Execute the Command
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

bot.login(token);