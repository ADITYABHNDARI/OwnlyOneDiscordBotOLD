const { MessageEmbed } = require('discord.js');

// inside a command, event listener, etc.


module.exports = {
  config: {
    name: 'make-team',
    aliases: ['mt'],
    description: 'Helps to make team',
    cooldown: 1,
    usage: '<Total Members> <Team Size>',
    category: 'image'
  },
  execute (message, args) {
    const teamSize = +args[1];
    const players = randomize(Array.from({ length: args[0] }).map((_, i) => i + 1));
    const totalTeams = Math.ceil(args[0] / teamSize);
    let reply = '';
    for (let i = 0; i < totalTeams; i++) {
      reply += `Team ${i + 1} : ${players.splice(0, teamSize)}\n`;
    }
    console.log(reply);
    message.channel.send(reply);
  }
};

function randomize (array) {
  const temp = [];
  while (array.length) {
    temp.push(array.splice(Math.random() * array.length | 0, 1)[0]);
  }
  return temp;
}