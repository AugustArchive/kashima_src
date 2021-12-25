import { writeFileSync, existsSync } from 'fs';
import { HttpClient, middleware } from '@augu/orchid';
import { getCommitHash, sep } from '../util';
import { resolve, join } from 'path';
import { getLogString } from '../polyfills/Logger';
import SettingsManager from './managers/SettingsManager';
import * as Constants from '../util/Constants';
import ContextMenuAPI from './apis/ContextMenuAPI';
import ThemesManager from './managers/ThemeManager';
import { Updatable } from './entities/Updatable';
import { format } from 'url';
import { Ichigo } from '@augu/ichigo';
import electron from 'electron';
import EnvAPI from './apis/EnvironmentAPI';

interface BuildInfo {
  /**
   * The commit hash from the repository
   */
  commitHash: string;

  /**
   * The current version of Kashima
   */
  version: string;

  /**
   * The environment to use for Node.js
   */
  nodeEnv: 'development' | 'production';

  /**
   * The update channel the user is using
   * 
   * - edge: **Cutting Edge Builds (not stable)**
   * - nightly: **Updated frequently**
   * - stable: **Stablized version**
   */
  type: 'alpha' | 'beta' | 'master';

  /**
   * The date the build has been published
   */
  date: string;
}

const getBuildPath = () => `${electron.app.getAppPath()}${sep}build.json`;
const appRoot = electron.app.getAppPath();
const pkg = require(`${appRoot}/package.json`);

function updateBuildInfo(build: BuildInfo) {
  const path = getBuildPath();
  if (!existsSync(path)) {
    log('warn', `Missing build.json in {colors:red:${path}}!`);
    const _build: BuildInfo = {
      commitHash: getCommitHash(),
      version: pkg.version,
      nodeEnv: 'production',
      type: 'alpha',
      date: new Date().toISOString()
    };

    writeFileSync(path, JSON.stringify(_build, null, 2));
    process.env.NODE_ENV = 'production';
    return _build;
  }

  process.env.NODE_ENV = build.nodeEnv;
  build.commitHash = getCommitHash();
  build.version = pkg.version;
  build.date = new Date().toISOString();
  writeFileSync(path, JSON.stringify(build, null, 2));

  return build;
}

export class Application extends Updatable {
  private handleReactJobs: { [x: string]: (() => void) | (() => Promise<void>) } = {};
  public contextMenu!: ContextMenuAPI;
  public settings: SettingsManager;
  public themes: ThemesManager;
  public window: electron.BrowserWindow | null;
  public build: BuildInfo;
  public tray: electron.Tray | null;
  public http: HttpClient;
  public rpc: Ichigo;
  #env: EnvAPI;

  constructor(build: BuildInfo) {
    super();

    this.settings = new SettingsManager();
    this.themes = new ThemesManager(this);
    this.window = null;
    this.build = updateBuildInfo(build);
    this.tray = null;
    this.http = new HttpClient();
    this.rpc = new Ichigo('519521041966563338');
    this.#env = new EnvAPI({
      path: resolve(appRoot, '.env')
    });

    this
      .http
      .use(middleware.logging({
        binding: (level, msg) => getLogString(level, msg)
      }));

    this.inject(this);
  }

  get fetchUrl() {
    return null;
  }

  getDownloadUrl() {
    return `https://api.kashima.app/downloads/desktop?os=${process.platform}`;
  }

  getFolder() {
    return this.build.nodeEnv === 'development' ? process.cwd() : electron.app.getAppPath();
  }

  loadWindow() {
    log('info', 'Now setting up...');
    this.#env.parse();

    this.window = new electron.BrowserWindow({
      title: 'Kashima | Desktop App',
      show: false,
      webPreferences: {
        nodeIntegration: true,
        devTools: process.env.NODE_ENV === 'development'
      }
    });

    const menu = this.buildMenu(process.env.NODE_ENV === 'development');
    this.window.setMenu(menu);

    this.tray = new electron.Tray(electron.nativeImage.createFromDataURL('https://cdn.kashima.app/icons/icon.ico'));
    this.tray.setContextMenu(electron.Menu.buildFromTemplate([
      {
        label: 'Check for updates',
        click: () => new electron.Notification({
          title: 'Updater',
          body: 'Updater is a work in progress...'
        }).show()
      }
    ]));

    this.window.once('ready-to-show', () => {
      log('info', 'Renderer process has finished, now showing window...');
      this.window!.show();

      this.contextMenu = new ContextMenuAPI(this); // The API requires the window to be fully ready
      this.contextMenu.create([
        {
          visible: process.env.NODE_ENV === 'development',
          role: 'toggleDevTools'
        },
        {
          visible: process.env.NODE_ENV === 'development',
          role: 'reload'
        }
      ]);
    });

    this.window.on('closed', () => {
      this.contextMenu.dispose();
      this.window = null;
    });

    this.window.loadURL(format({
      pathname: join(__dirname, '..', '..', 'public', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    return this.window;
  }

  get constants() {
    return Constants;
  }

  redirect(path: string = '/') {
    if (this.window === null) throw new Error('Window object is null, please do it before the window loads!');

    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      log('info', `Redirecting to ${path}...`);
      this.window.loadURL(`http://localhost:6969${path}`);
    } else {
      this.window.loadURL('https://github.com/auguwu'); // TODO: Find a way to do something with this
    }
  }

  addJob(name: string, callback: () => void | Promise<void>) {
    this.handleReactJobs[name] = callback;
  }

  private buildMenu(dev: boolean) {
    const template: (electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [];
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