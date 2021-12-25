import { sep, ignoreFile, Constants } from '../../util';
import { app as Electron, dialog } from 'electron';
import { promises as fs } from 'fs';
import { Application } from '..';
import { Collection } from '@augu/immutable';
import { join } from 'path';
import Theme from '../entities/Theme';

export default class ThemeManager extends Collection<Theme> {
  public directory: string;
  public app: Application;

  constructor(app: Application) {
    super();

    this.directory = `${Electron.getPath('userData')}${sep}Themes`;
    this.app = app;
  }

  appendPath(...paths: string[]) {
    return join(this.directory, ...paths);
  }

  findTheme(id: string) {
    return this.find(theme => theme.info.id === id);
  }

  async load() {
    const themes = await fs.readdir(this.directory);
    const stats = await fs.stat(this.directory);

    if (!themes.length) return log('error', `Missing themes directory ({colors:red:${this.directory.replace(':', ';')}})`);
    if (!stats.isDirectory()) {
      log('error', 'Themes directory wasn\'t a directory?');
      dialog.showErrorBox('Corrupted Installation', 'Themes directory was not a directory, if you keep getting this, contact support at https://support.kashima.app');
      return;
    }

    for (const theme of themes) {
      log('info', `Now initializing theme {colors:green:${theme}}`);
      const files = await fs.readdir(this.appendPath(theme));

      if (!files.length) return log('error', `Missing files in theme {colors:yellow:${theme}}`);

      log('info', 'Checking if there is a .kashimaignore file...');
      const ignoredFiles: string[] = [];

      if ((files.indexOf('.kashimaignore')) > 0) {
        log('info', 'Found .kashimaignore file, now ignoring contents...');
        const content = await fs.readFile(this.appendPath(theme, '.kashimaignore'), 'utf-8');
        const ignored = await ignoreFile(this.appendPath(theme), content);

        if (!ignored.length) {
          log('warn', '.kashimaignore file is present but no directories or files were implemented.');
          continue;
        }

        ignoredFiles.push(...ignored.map(x => x[1]));
      }

      if ((files.indexOf('manifest.json')) > 0) {
        try {
          const contents = await fs.readFile(this.appendPath(theme, 'manifest.json'), 'utf-8');
          const manifest = JSON.parse(contents);
          const error = await this._build(manifest, theme);
          if (error) {
            log('error', error);
            continue;
          }
        } catch {
          log('error', 'Manifest was not in JSON');
        }
      }

      if ((files.indexOf('manifest.js')) > 0) {
        try {
          const manifest = await import(this.appendPath(theme, 'manifest.js'));
          const error = await this._build(manifest, theme);
          if (error) {
            log('error', error);
            continue;
          }
        } catch {
          log('error', 'Manifest was not a proper JavaScript file');
        }
      }

      for (const file of files) {
        if (ignoredFiles.includes(file)) continue;
      }
    }
  }

  private async _build(manifest: Constants.Types.ThemeInfo, theme: string) {
    if (Array.isArray(manifest)) return `Manifest file for theme ${theme} shouldn't be an Array`;

    const keys = Object.keys(manifest);
    if (
      !keys.includes('mainFile') ||
      !keys.includes('name') ||
      !keys.includes('id')
    ) return `Missing a required manifest key for theme ${theme} (missing 'mainFile,' 'name,' or 'id')`;

    const mainFile = manifest.mainFile.replace('./', this.appendPath(theme));
    const skin = new Theme(this.app, manifest);

    this.set(skin.info.id, skin);

    log('info', `Checking if theme "${skin.info.name}" can be updated`);
    const canUpdate = await skin.canUpdate();
    if (canUpdate) await skin.update();

    try {
      log('info', 'Applying theme...');
      const contents = await fs.readFile(mainFile, 'utf-8');
      await skin.apply(contents);
    } catch {
      this.delete(skin.info.id);
      return `Theme ${theme}'s main file can't be parsed to UTF-8`;
    }
  }
}