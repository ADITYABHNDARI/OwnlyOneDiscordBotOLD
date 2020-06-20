module.exports = {
  config: {
    name: 'prune',
    aliases: ['delete', 'remove'],
    description: 'helps to delete multiple messages in the channel.',
    usage: '<number-of-messages>',
    cooldown: 10,
    category: 'moderation'
  },
  execute (message, args) {
    if (!args[0]) {
      return message.delete();
    }
    const amount = parseInt(args[0]) + 1;
    console.log(amount)
    if (isNaN(amount)) {
      return message.reply('that doesn\'t seems to be a valid number!');
    } else if (amount < 3 || amount > 99) {
      return message.reply('you need to enter a number between 2 and 100');
    }

    message.channel.bulkDelete(amount, true)
      .then(messages => {
        message.channel.send(`Successfully deleted ${messages.size} messages from the channel!`).then(msg => setTimeout(() => msg.delete(), 15000));
      })
      .catch(err => {
        console.error(err);
        message.channel.send('there was an error trying to prune messages in this channel!');
      });
  }
};