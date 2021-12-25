import { app as App, dialog } from 'electron';
import { sep, ignoreFile } from '../../util';
import { promises as fs } from 'fs';
import { Application } from '../Application';
import { Collection } from '@augu/immutable';
import { Skin } from '../entities/Skin';
import { join } from 'path';

interface CompiledStylesheet {
  includes: string[];
  data: string;
}

export default class SkinManager extends Collection<Skin> {
  /** The directory where the skins are gonna be placed in */
  public directory: string;

  constructor(public app: Application) {
    super();

    this.directory = `${App.getPath('userData')}${sep}Skins`;
  }

  /**
   * Join the skins directory with a new appended directory
   * @param paths The paths to append
   */
  appendPath(...paths: string[]) {
    return join(this.directory, ...paths);
  }

  /**
   * Process all skins
   */
  async start() {
    const skins = await fs.readdir(this.directory);
    const dirStats = await fs.stat(this.directory);

    if (!skins.length) {
      log('error', `Missing skins directory: {colors:red:${this.directory.replace(':', '')}}`);
      return;
    }

    if (!dirStats.isDirectory()) {
      log('error', 'Skins directory was not a directory.');
      dialog.showErrorBox('Corrupted Installation', 'Skins directory was not a directory. If you keep getting this error, contact support (https://support.kashima.app/tickets/create?code=5505)');
      return;
    }

    for (const skin of skins) {
      log('info', `Now initializing skin {color:green:${skin}}`);
      const files = await fs.readdir(this.appendPath(skin));

      if (!files.length) {
        log('error', `Missing files in skin {color:yellow:${skin}}`);
        return;
      }

      log('info', 'Checking for .kashimaignore file...');
      const ignore = files.indexOf('.kashimaignore');
      const filesToIgnore: string[] = [];

      if (ignore !== -1) {
        log('info', 'Found ignore file, finding contents and ignoring...');
        const content = await fs.readFile(this.appendPath(skin, '.kashimaignore'), 'utf-8');
        const ignoreFiles = await ignoreFile(this.appendPath(skin), content);

        if (!ignoreFiles.length) {
          log('warn', 'Ignore file is present but no files or directories was implemented in them?');
          continue;
        }

        filesToIgnore.push(...ignoreFiles.map(s => s[1]));
      }

      if (files.indexOf('manifest.json') !== -1) {
        const contents = await fs.readFile(this.appendPath(skin, 'manifest.json'), 'utf-8');
        const manifest = JSON.parse(contents);
        const errors = await this.buildSkin(manifest, skin);
        if (errors) {
          log('error', errors);
          continue;
        }
      }

      if (files.indexOf('manifest.js') !== -1) {
        const manifest = await import(this.appendPath(skin, 'manifest.js'));
        const errors = await this.buildSkin(manifest, skin);
        if (errors) {
          log('error', errors);
          continue;
        }
      }

      if (filesToIgnore.includes(skin)) continue;
    }
  }

  private async buildSkin(manifest: any, file: string) {
    if (Array.isArray(manifest)) return `Manifest file for skin ${file} is an array.`;

    const keys = Object.keys(manifest);
    if (!keys.includes('mainFile') || !keys.includes('name') || !keys.includes('id')) return `Invalid manifest file in plugin ${file} (Missing 'mainFile' or 'name' or 'id')`;

    const mainFile: string = manifest.mainFile.replace('./', this.appendPath(file));
    const dir = this.appendPath(file);
    const skin = new Skin(manifest);
  
    // Add it to the collection
    this.set(skin.info.id, skin);

    // Check for any updates
    const canUpdate = await skin.canUpdate();
    if (canUpdate) await skin.update(true);

    // Apply it
    const contents = await fs.readFile(mainFile, 'utf-8');
    await skin.apply(contents);
  }
}