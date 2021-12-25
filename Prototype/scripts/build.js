#!/usr/bin/env node
const builder = require('electron-builder');
const child = require('child_process');
const leeks = require('leeks.js');
const path = require('path');
const pkg = require('../package.json');
const fs = require('fs');

/**
 * Logs a message to the console
 * @param {'info' | 'warn' | 'error' | 'debug'} type The log level
 * @param  {...(string | object)} message The message to send
 */
const log = (type, ...message) => {
  let lvlText;

  switch (type) {
    case 'info': lvlText = leeks.colors.bgBlue(' INFO  '); break;
    case 'warn': lvlText = leeks.colors.bgYellow(leeks.colors.black(' WARN  ')); break;
    case 'debug': lvlText = leeks.colors.bgGray(' DEBUG '); break;
    case 'error': lvlText = leeks.colors.bgRed(' ERROR ');
  }

  const msg = message.map(x =>
    x instanceof Object ? (require('util')).inspect(x) : x  
  );

  process.stdout.write(`${lvlText} | ${msg.join('\n')}`);
};

/**
 * Parses all the arguments to return an object structure
 * @param {string[]} args The arguments provided
 * @returns {{ [x: string]: string | true }}
 */
const parseFlags = (args) => {
  const flags = args.join(' ');
  const parsed = {};

  if (!flags.includes('-')) return {};

  const all = flags.split('-').filter((flag, index) =>
    index === 0 || flag !== ''
  );

  for (const flag of all) {
    if (!flag.includes(' ') || flag[0] === ' ' || flag[flag.length - 1] === ' ') {
      parsed[flag.split(' ').filter((flag, index) => index === 0 || flag !== '')[0]] = true;
      continue;
    }

    const name = flag.split(/\s+/g)[0];
    const value = flag.slice(flag.indexOf(' ') + 1).trim();
    parsed[name] = value;
  }

  return parsed;
};

const main = () => new Promise((resolve, reject) => {
  const args = process.argv.slice(2);
  const flags = parseFlags(args);

  log('info', 'Now linting repository...');
  const eslint = child.spawn('yarn lint');
  const codes = {};

  eslint.stdout.on('data', (data) => log('info', data));
  eslint.stderr.on('data', (data) => log('error', data));
  eslint.on('close', (code) => {
    codes['eslint'] = code;
    eslint.stdin.end();
  });

  log('info', 'Now ');
});

main()
  .then(process.exit)
  .catch(error => {
    log('error', error);
    process.exit(1);
  });