//* Add the commons modules in the global paths
// @ts-ignore
require('module').Module.globalPaths.push(require('path').join(__dirname, 'commons'));

import { existsSync, mkdirSync } from 'fs';
import { isNode10, isThenable } from './util';
import { createDispatcher } from 'event-dispatcher';
import { Application } from './structures/Application';
import { RPC, Types } from './util/Constants';
import { resolve, join } from 'path';
import electron from 'electron';
import child from 'child_process';

//* Polyfills
import './polyfills/Logger';
const userData = electron.app.getPath('userData');

//* Safely exist if the user isn't running Node.js v10 or higher
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

global.kashima = app;

let win!: electron.BrowserWindow;
const dispatcher = createDispatcher('global');

const mount = async() => {
  if (
    process.platform === 'darwin' &&
    !process.env.PATH!.includes('/usr/local/bin')
  ) {
    log('warn', 'Missing "/usr/local/bin" directory.');
    process.env.PATH += ':/usr/local/bin';
  }

  if (!existsSync(resolve(userData, 'Plugins'))) {
    log('warn', 'Missing "Plugins" directory!');
    mkdirSync(resolve(userData, 'Plugins'));
  }
  
  if (!existsSync(resolve(userData, 'Skins'))) {
    log('warn', 'Missing "Skins" directory!');
    mkdirSync(resolve(userData, 'Skins'));
  }

  win = app.loadWindow();

  log('info', 'Initializing all plugins...');
  await app.plugins.start();

  log('info', 'Initialized all plugins! Now initializing all skins...');
  await app.skins.start();

  log('info', 'Initalized all plugins and skins! Loading dispatcher events...');
  loadEvents();

  log('info', 'Initialized dispatcher events, now spawning RabbitMQ broker instance');
  const broker = child.spawn('python', [
    '-u', 
    join(__dirname, '..', 'broker', 'main.py')
  ]);

  broker.stdout.on('data', data => log('info', data));
  broker.stderr.on('data', data => log('error', data));
  broker.stderr.on('close', () => log('warn', 'RabbitMQ broker has closed'));
};

// TODO: make this unmessy
const loadEvents = () => {
  dispatcher.on('playing', (info: Types.SongInfo) => {
    log('info', 'Setting RPC status to "playing"...');
    app.rpc.setActivity(RPC.Statuses.Playing(info));
  });

  dispatcher.on('main', () => {
    log('info', 'Setting RPC status to "main"...');
    app.rpc.setActivity(RPC.Statuses.MainMenu);
  });

  dispatcher.on('store', () => {
    log('info', 'Setting RPC status to "store"...');
    app.rpc.setActivity(RPC.Statuses.Store);
  });

  dispatcher.on('store.plugin', () => {
    log('info', 'Setting RPC status to "store.plugin"...');
    app.rpc.setActivity(RPC.Statuses.PluginStore);
  });

  dispatcher.on('store.skin', () => {
    log('info', 'Setting RPC status to "store.skin"...');
    app.rpc.setActivity(RPC.Statuses.SkinStore);
  });

  dispatcher.on('plugin', (info: Types.PluginInfo) => {
    log('info', 'Setting RPC status to "plugin"...');
    app.rpc.setActivity(RPC.Statuses.Plugin(info));
  });

  dispatcher.on('skin', (info: Types.SkinInfo) => {
    log('info', 'Setting RPC status to "skin"...');
    app.rpc.setActivity(RPC.Statuses.Skin(info));
  });
};

const onClose = async() => {
  log('warn', 'Application is being closed...');
  for (const plugin of app.plugins.values()) {
    if (isThenable(plugin.base.unmount)) await plugin.base.unmount();
    else plugin.base.unmount();
  }

  for (const skin of app.skins.values()) skin.eject();

  app.plugins.clear();
  app.skins.clear();
};

electron
  .app
  .on('ready', async() => {
    await mount();
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
    if (win === null) await mount();
  })
  .on('second-instance', () => electron.app.exit(0))
  .on('window-all-closed', async() => {
    await onClose();
    if (process.platform !== 'darwin') electron.app.quit();
  });

export { app };