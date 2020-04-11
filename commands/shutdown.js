module.exports = {
  config: {
    name: 'shutdowns',
    aliases: ['sd'],
    description: 'Development purpose only',
    cooldown: 10,
    category: 'miscellaneous'
  },
  execute (message, args) {
    message.reply(`The bot will now shut down. \nConfirm with a thumb up or deny with a thumb down.`).then(replyMessage => {
      /*  replyMessage.react('👍').then(r => replyMessage.react('👎'));
 
       replyMessage.awaitReactions(
         (reaction, user) => !user.bot && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
         { max: 3, time: 30000 }
       ).then(collected => {
         if (collected.first().emoji.name == '👍') {
           message.reply('Shutting down...');
           // client.destroy();
         }
         else
           message.reply('Operation canceled.');
       }).catch(() => {
         message.reply('No reaction after 30 seconds, operation canceled');
       }); */
      // Reacts so the user only have to click the emojis

      message.react('👍').then(r => message.react('👎'));

      const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someID';
      const collector = message.createReactionCollector(
        (reaction, user) => !user.bot && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'), { time: 15000 });
      collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
      collector.on('end', collected => console.log(`Collected ${collected.size} items`));






      // First argument is a filter function
      /*  message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
         { max: 4, time: 30000 }).then(collected => {
           if (collected.first().emoji.name == '👍') {
             message.reply('Shutting down...');
             // client.destroy();
           }
           else
             message.reply('Operation canceled.');
         }).catch(() => {
           message.reply('No reaction after 30 seconds, operation canceled');
         }); */
    });
  }
};