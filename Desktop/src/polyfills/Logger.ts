import { inspect } from 'util';
import leeks from 'leeks.js';

if (!global.hasOwnProperty('log')) {
  global.log = (type: 'info' | 'error' | 'warn' | 'debug', ...message: any[]) => {
    let lvlText!: string;
    
    switch (type) {
      case 'info': lvlText = leeks.colors.cyan(`[INFO/${process.pid}]`); break;
      case 'warn': lvlText = leeks.colors.yellow(`[WARN/${process.pid}]`); break;
      case 'debug': lvlText = leeks.colors.green(`[DEBUG/${process.pid}]`); break;
      case 'error': lvlText = leeks.colors.red(`[ERROR/${process.pid}]`); break;
    }
  
    const msg = message.map(x => 
      escape(x instanceof Object ? inspect(x) : x instanceof Array ? `[${x.join(', ')}]` : x instanceof Error ? prettifyError(x) : x as string)
    ).join('\n');
    process.stdout.write(`${leeks.colors.gray(getDate())} ${lvlText} | ${msg}\n`);
  };
}

export const getLogString = (level: 'info' | 'warn' | 'error', message: string) => {
  let lvlText!: string;
  
  switch (level) {
    case 'info': lvlText = leeks.colors.cyan(`[INFO/${process.pid}]`); break;
    case 'warn': lvlText = leeks.colors.yellow(`[WARN/${process.pid}]`); break;
    case 'error': lvlText = leeks.colors.red(`[ERROR/${process.pid}]`); break;
  }

  return `${leeks.colors.gray(getDate())} ${lvlText} | ${message}`;
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

const MONTHS: { [x: number]: string } = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sept',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
};

const getDate = () => {
  const d = new Date();
  const escape = (type: any) => `0${type}`.slice(-2);
  
  const month = MONTHS[d.getMonth()];
  const day = ordinal(d.getDate()) === null ? '' : ordinal(d.getDate());
  const year = d.getFullYear();

  return `[${month} ${day}, ${year} | ${escape(d.getHours())}:${escape(d.getMinutes())}:${d.getSeconds()}]`;
};

const ordinal = (int: number) => int == 1 ? `${int}st` : int == 2 ? `${int}nd` : int == 3 ? `${int}rd` : int >= 4 ? `${int}th` : null;

const prettifyError = (error: Error) => {
  const strings = [`${error.name}: ${error.message}`];
  if (error.stack) {
    const stacktrace = error.stack.split('\n');
    stacktrace.shift();

    for (const trace of stacktrace) {
      const tracked = trace.split('at')[1];
      let file = tracked.split('(')[1];

      if (file === undefined) continue;
      else {
        file = file.replace(')', '');
        strings.push(`  - in ${file}`);
      }
    }
  }

  const allStrings = strings.filter(x => !x.includes('internal/')).join('\n');
  return allStrings;
};