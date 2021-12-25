import { inspect } from 'util';
import leeks from 'leeks.js';

global.log = (type: 'info' | 'error' | 'warn' | 'debug', ...message: (string | object)[]) => {
  let lvlText!: string;
  
  switch (type) {
    case 'info': lvlText = leeks.colors.bgBlue(' INFO  '); break;
    case 'warn': lvlText = leeks.colors.bgYellow(leeks.colors.black(' WARN  ')); break;
    case 'debug': lvlText = leeks.colors.bgGray(' DEBUG '); break;
    case 'error': lvlText = leeks.colors.bgRed(' ERROR ');
  }

  const msg = message.map(x => escape(x instanceof Object ? inspect(x) : x as string)).join('\n');
  process.stdout.write(`${lvlText} | ${msg}\n`);
};

const findContent = (text: string) => {
  const found: string[] = [];
  const regex = /{([^}]+)}/g;
  let curMatch: any;

  while (curMatch = regex.exec(text)) found.push(curMatch[1]);

  return found;
};

const escape = (text: string) => {
  const schemes = findContent(text);
  const colors = schemes.filter(x =>
    x.includes('colors:') || x.includes('styles:')  
  );

  let c = text;
  if (!colors.length) return text;
  else {
    for (const color of colors) {
      const [, type, content] = color.split(':');
      c = c.replace(`{colors:${type}:${content}}`, leeks.colors[type](content));
    }
  }

  return c;
};