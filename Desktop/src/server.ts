// Polyfill "global.log"
import './polyfills/Logger';

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import path from 'path';

const appDir = process.cwd().split(process.platform === 'win32' ? '\\' : '/');
if (appDir[appDir.length - 1] === 'dist') throw new Error('You must not be in the "dist" directory!');

const port = 6969;
const app = next({
  dev: true,
  dir: path.join(process.cwd(), 'app')
});

const handler = app.getRequestHandler();
log('info', 'Building development server...');

app
  .prepare()
  .then(() => {
    log('info', 'Prepared the dev server, now making it into a HTTP server...');

    const server = createServer((req, res) => handler(req, res, parse(req.url as string, true)));
    server.listen(port, () => log('info', `Development server is live on http://localhost:${port}!`));
  });