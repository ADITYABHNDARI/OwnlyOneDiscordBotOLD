module.exports = {
  config: {
    name: 'reload',
    // aliases: ['delete', 'remove'],
    description: 'Reloads a Command',
    usage: '<Command which to Reload>',
    args: true,
    incomplete: true,
    category: 'temporary'
  },
  execute (message, args) {
    if (!!message.mentions.users.first()) {
      return message.reply('Argh! How can you even reload a User?');
    }
    if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);
    const commandName = args[0].toLowerCase();
    let command = message.client.commands.get(commandName)
      || message.client.commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));

    if (!command)
      return message.reply(`I found no command with such name or alias \`${commandName}\`!`);

    delete require.cache[require.resolve(`./${commandName}.js`)];

    try {
      const newCommand = require(`./${commandName}.js`);
      message.client.commands.set(newCommand.config.name, newCommand);
    } catch (error) {
      console.log(error);
      message.channel.send(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
    }

    message.channel.send(`Command \`${commandName}\` reloaded successfully!`);
  }
};