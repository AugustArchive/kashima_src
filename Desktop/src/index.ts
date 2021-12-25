import { existsSync, mkdirSync } from 'fs';
import { Application } from './lib';
import { isNode10 } from './util';
import { resolve } from 'path';
import electron from 'electron';
import { RPC } from './util/Constants';

import './polyfills/Logger';
const userData = electron.app.getPath('userData');

if (!isNode10()) {
  log('warn', `You are required to use Node.js v10 or higher. Please upgrade Node.js (Current: ${process.version})`);
  
  const notification = new electron.Notification({
    title: 'Unable to run',
    body: `You are required to use Node.js v10 or higher. Please upgrade Node.js (Current: ${process.version})`
  });

  notification.show();
  process.exit(1);
}

const build = require('./build.json');
const app = new Application(build);
let win!: electron.BrowserWindow;

global.kashima = app;

const mountApp = async() => {
  console.log('---------------------------------------------------');
  console.log('    _  __         _     _                   ');
  console.log('   | |/ /        | |   (_)                  ');
  console.log('   | \\\'  __ _ ___| |__  _ _ __ ___   __ _   ');
  console.log('   |  < / _` / __| \\\'_ \\| | \'_ ` _ \\ / _` |  ');
  console.log('   | . \\ (_| \\__ \\ | | | | | | | | | (_| |  ');
  console.log('   |_|\\_\\__,_|___/_| |_|_|_| |_| |_|\\__,_|  ');
  console.log('---------------------------------------------------');
  console.log(`Version: ${kashima.build.version} [${kashima.build.commitHash.slice(0, 7)}] | Build: ${kashima.build.type}\n`);

  electron.app.setAppUserModelId('app.kashima.desktop');
  if (process.platform === 'darwin' && !process.env.PATH!.includes('/usr/local/bin')) {
    log('warn', 'Missing "/usr/local/bin" directory, I added it for you');
    process.env.PATH += ':/usr/local/bin';
  }

  if (!existsSync(resolve(userData, 'Themes'))) {
    log('warn', 'Missing "Themes" directory');
    mkdirSync(resolve(userData, 'Themes'));
  }

  win = app.loadWindow();

  log('info', 'Initializing all themes...');
  await app.themes.load();

  log('info', 'Initialized everything!');
};

//const onClose = () => {
//  log('warn', 'Application is currently being closed...');
//  for (const theme of app.themes.values()) theme.eject();
//
//  app.themes.clear();
//};

/**
 * Adds the `kashima://` HTTP protocol
 */
const addProtocol = () => {
  log('info', 'Creating "kashima://" protocol...');
  electron.protocol.registerHttpProtocol('kashima', (request) => {
    // idk what to do but this might work
    const fullUrl = request.url.split('://')[1];
    function getParam(name: string) {
      const param = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp(`[?&]${param}(=([^&#]*)|&|#|$)`);
      const results = regex.exec(fullUrl);

      return (results ? results[2] ? decodeURIComponent(results[2].replace(/\+/g, ' ')) : null : null);
    }

    console.log(fullUrl);
  });
};

electron
  .app
  .on('ready', async() => {
    await mountApp();
    addProtocol();
    kashima.redirect();
    
    const isEnabled = app.settings.get('rpc', true);
    if (isEnabled) {
      app.rpc.on('ready', () => {
        log('info', 'RPC connection has opened');
        app.rpc.setActivity(RPC.Statuses.MainMenu);
      });
  
      app.rpc.on('open', () => log('info', 'RPC connection has been received'));
      app.rpc.on('error', (error) => log('error', 'RPC exception', error));
      app.rpc.on('close', (reason) => log('warn', 'RPC connection has closed for', reason));
      app.rpc.connect();
  
      log('info', 'Mounted application with Ichigo enabled');
    }
  })
  .on('activate', async () => {
    if (win === null) await mountApp();
  })
  .on('second-instance', () => electron.app.exit(0))
  .on('window-all-closed', async() => {
    //onClose();
    if (process.platform !== 'darwin') electron.app.quit();
  });
//.on('before-quit', onClose);

process.on('uncaughtException', reason => {
  electron.dialog.showMessageBox({
    message: `Something failed while running: ${reason.message}`,
    title: 'Exception occured in main process',
    type: 'error'
  });

  log('error', 'An uncaught exception has occured', reason);
});

process.on('exit', code => {
  log('warn', `Process has ended with code ${code}`);
  electron.app.quit();
});