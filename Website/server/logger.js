const { inspect } = require('util');
const { colors } = require('leeks.js');

/**
 * Logs a message to the console
 * @param {'request' | 'debug' | 'error' | 'info'} type The type to log as
 * @param  {...any[]} message The message to print
 */
const log = (type, ...message) => {
  let lvlText;

  switch (type) {
    case 'request': lvlText = colors.bgMagenta(' REQUEST '); break;
    case 'debug': lvlText = colors.bgGray('  DEBUG  '); break;
    case 'error': lvlText = colors.bgRed('  ERROR  '); break;
    case 'info': lvlText = colors.bgCyan('  INFO   '); break;
  }

  const msg = message.map(x => 
    x instanceof Array ? `[${x.join(', ')}]` : x instanceof Object ? inspect(x) : x
  ).join('\n');

  process.stdout.write(`${lvlText} | ${msg}\n`);
};

module.exports = log;