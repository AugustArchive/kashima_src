import { Application } from '..';
import electron, { app } from 'electron';

type IDisposable = () => void;

/**
 * API to handle all context menu-like architecture
 * 
 * Credit: [sindresorhus/electron-context-menu](https://github.com/sindresorhus/electron-context-menu)
 */
export default class ContextMenuAPI {
  /**
   * The web contents itself
   */
  private webContents: electron.WebContents;

  /**
   * Any disposables to die out
   */
  public disposables: IDisposable[];

  /**
   * If this class is disposed (not longer in use)
   */
  public disposed: boolean;

  /**
   * Construct a new instance of the Context Menu API
   * @param app The application
   */
  constructor(private app: Application) {
    if (app.window === null) throw new Error('Window has not loaded, please use this when the application has fully loaded.');

    this.webContents = app.window.webContents;
    this.disposables = [];
    this.disposed = false;
  }

  /**
   * Creates the menu
   */
  create(template: (electron.MenuItemConstructorOptions | electron.MenuItem)[]) {
    if (this.disposed) throw new Error('Context Menu has been disposed and no longer in use.');

    const handle = () => {
      const menu = (electron.remote ? electron.remote : electron).Menu.buildFromTemplate(template);
      menu.popup({ window: electron.remote ? electron.remote.getCurrentWindow() : this.app.window! });
    };

    this.webContents.on('context-menu', handle);
    this.disposables.push(() => {
      this.webContents.removeListener('context-menu', handle);
    });
  }

  dispose() {
    if (this.disposed) throw new Error('Context Menu is disposed, why call it again?');

    for (const dispose of this.disposables) dispose();
    this.disposed = true;
  }
}