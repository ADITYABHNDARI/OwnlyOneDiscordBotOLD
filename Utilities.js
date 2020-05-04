function showOnConsole (msg, data, type = 'error') {
  const text = `\n----------------------\n${msg}\n----------------------\n`;
  console[type](text, data);
}

module.exports.showOnConsole = showOnConsole;