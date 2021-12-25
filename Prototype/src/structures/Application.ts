import { EventDispatcher, createDispatcher, dispatchEvent } from 'event-dispatcher';
import { writeFileSync, existsSync } from 'fs';
import { getCommitHash, sep } from '../util';
import { resolve, join } from 'path';
import PluginManager from './managers/PluginManager';
import ConfigManager from './managers/ConfigurationManager';
import SkinManager from './managers/SkinManager';
import { Ichigo } from '@augu/ichigo';
import { format } from 'url';
import ToastsAPI from './apis/ToastAPI'; 
import electron from 'electron';
import Matsuwa from 'matsuwa';
import EnvAPI from './apis/EnvironmentAPI';

const getBuildPath = (env: 'development' | 'production') => env === 'development' ? `${process.cwd()}${sep}dist${sep}build.json` : `${electron.app.getPath('userData')}${sep}build.json`;
const pkg = require('../../package.json');

function updateBuildInfo(build: Matsuwa.BuildInfo) {
  const path = getBuildPath(build.nodeEnv);
  if (!existsSync(path)) {
    log('warn', `Missing build.json in {colors:red:${path}}!`);
    const _build: Matsuwa.BuildInfo = {
      commitHash: getCommitHash(),
      version: pkg.version,
      nodeEnv: 'production',
      mode: 'stable'
    };

    writeFileSync(path, JSON.stringify(_build, null, 2));
    process.env.NODE_ENV = 'production';
    return _build;
  }

  process.env.NODE_ENV = build.nodeEnv;
  build.commitHash = getCommitHash();
  build.version = pkg.version;
  writeFileSync(path, JSON.stringify(build, null, 2));

  return build;  
}

export class Application extends EventDispatcher {
  public settings: ConfigManager;
  public ipcPing: NodeJS.Timer | null;
  public plugins: PluginManager;
  public toasts: ToastsAPI;
  public window: electron.BrowserWindow | null;
  public build: Matsuwa.BuildInfo;
  public skins: SkinManager;
  public tray: electron.Tray | null;
  private env: EnvAPI;
  public rpc: Ichigo;

  constructor(build: Matsuwa.BuildInfo) {
    super('app');

    this.settings = new ConfigManager();
    this.ipcPing = null;
    this.plugins = new PluginManager(this);
    this.toasts = new ToastsAPI();
    this.window = null;
    this.build = updateBuildInfo(build);
    this.skins = new SkinManager(this);
    this.tray = null;
    this.rpc = new Ichigo('519521041966563338');
    this.env = new EnvAPI({
      encoding: 'utf8',
      path: resolve(__dirname, '..', '..', '.env')
    });

    this.addEvents();
  }

  private addEvents() {
    this.on('visit', (page: 'skins' | 'plugins' | 'preview.skin' | 'preview.plugin' |'login' | null) => {
      log('info', `Going to page ${page === null ? 'main' : page}`);
      this.visit(page);
    });

    this.on('load.plugin', (plugin: Matsuwa.InternalPlugin) => {
      log('info', `Loading plugin preview ${plugin.info.id}...`);
      this.visit('preview.plugin', plugin);
    });

    this.on('load.skin', (skin: Matsuwa.Skin) => {
      log('info', `Loading skin preview ${skin.info.id}...`);
      this.visit('preview.skin', skin);
    });
  }

  loadWindow() {
    log('info', 'Now setting up...');
    this.env.parse();

    const browser = new electron.BrowserWindow({
      title: 'Kashima | Desktop App',
      webPreferences: {
        nodeIntegration: true,
        devTools: process.env.NODE_ENV === 'development'
      }
    });

    const menu = this.buildMenu(process.env.NODE_ENV === 'development');

    browser.setMenu(menu);
    browser.loadURL(format({
      pathname: join(__dirname, '..', '..', 'public', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    const tray = new electron.Tray(electron.nativeImage.createFromPath(join(__dirname, '..', '..', '..',  'assets', 'icon.png')));
    tray.setContextMenu(electron.Menu.buildFromTemplate([
      {
        label: 'Check for updates',
        click: () => new electron.Notification({
          title: 'Updater',
          body: 'Updater is a work in progress...'
        }).show()
      }
    ]));

    browser.on('closed', () =>
      this.window = null
    );

    this.window = browser;
    this.tray = tray;

    return browser;
  }

  visit(page: 'skins' | 'plugins' | 'preview.skin' | 'preview.plugin' | 'login' | null, ...args: any[]): void {
    if (this.window === null) {
      log('warn', 'Browser window hasn\'t started.');
      return;
    }

    if (page === null) return void this.window.loadURL(format({
      pathname: join(__dirname, '..', '..', 'public', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    switch (page) {
      case 'login': return void this.window.loadURL(format({
        pathname: join(__dirname, '..', '..', 'public', 'login.html'),
        protocol: 'file:',
        slashes: true
      }));

      case 'plugins': return void this.window.loadURL(format({
        pathname: join(__dirname, '..', '..', 'public', 'stores', 'plugins.html'),
        protocol: 'file:',
        slashes: true
      }));

      case 'skins': return void this.window.loadURL(format({
        pathname: join(__dirname, '..', '..', 'public', 'stores', 'skins.html'),
        protocol: 'file:',
        slashes: true
      }));

      case 'preview.plugin': return void dispatchEvent('previews', 'plugin', args[0]);
      case 'preview.skin': return void dispatchEvent('previews', 'skin', args[0]);
      default: return void 0;
    }
  }

  private buildMenu(dev: boolean) {
    const template: (electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
      {
        label: 'Stores',
        submenu: [
          {
            label: 'Plugins',
            click: () => {
              log('warn', 'Plugin Store is not avaliable at this time');
              return void 0;
            }
          },
          {
            label: 'Skins',
            click: () => {
              log('warn', 'Skin Store is not avaliable at this time');
              return void 0;
            }
          }
        ]
      }
    ];

    if (dev) template.push({
      label: 'Development Kit',
      submenu: [
        { role: 'toggleDevTools' },
        { role: 'reload' }
      ]
    });

    return electron.Menu.buildFromTemplate(template);
  }
}