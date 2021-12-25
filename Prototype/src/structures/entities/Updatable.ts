import { existsSync, createReadStream, promises as fs } from 'fs';
import { Application } from '../Application';
import { execSync } from 'child_process';
import { dialog } from 'electron';
import { join } from 'path';
import { http } from 'matsuwa';
import semver from 'semver';
import tar from 'tar';
import os from 'os';

export class Updatable {
  /** The HTTP client */
  private http: http.HttpClient;
  
  /** The ID to fetch from */
  public id: string;

  /** The application instance */
  public app!: Application;

  /**
   * Creates a new instance of the `Updatable` class
   * @param id The ID of the entity
   */
  constructor(public type: 'skin' | 'plugin', id: string) {
    this.http = new http.HttpClient();
    this.id = id;
  }

  inject(app: Application) {
    this.app = app;
    return this;
  }

  /**
   * Immutable object of all folders to fetch from
   */
  get folders(): { [x in 'skin' | 'plugin']: string } {
    return {
      plugin: '%ROOT%/Plugins/%ID%',
      skin: '%ROOT%/Skins/%ID%'
    };
  }

  /**
   * Check if the entity can be updated
   */
  async canUpdate() {
    const folder = this.folders[this.type]
      .replace(/%ROOT/g, process.cwd()) // TODO: Find out where the application will be in
      .replace(/%ID%/g, this.id);

    if (!existsSync(folder)) {
      // log('info', `Unable to find folder: ${folder}`);
      dialog.showErrorBox(`Unable to update ${this.type}`, `Seems like you don't have ${this.type} ${this.id} installed? If this is reoccuring, please report it at https://tama.kashima.app`);
      return false;
    }

    const gitDir = join(folder, '.git');
    if (existsSync(gitDir)) {
      execSync('git fetch', { cwd: folder });
      const status = execSync('git status -uno', { cwd: folder, encoding: 'utf8' });

      return status.includes('git pull');
    } else {
      const manifest = JSON.parse(require(join(folder, 'manifest.json')));
      const res = await this.http.get('https://api.kashima.app/plugins', {
        headers: {
          'Content-Type': 'application/json'
        }
      }).query('id', this.id).execute();

      try {
        const data = res.json();
        if (semver.satisfies(data.version, manifest.version)) return false;
        return true;
      } catch(ex) {
        dialog.showErrorBox('Unable to parse data', 'I was unable to satisfy the versions due to not parsing data. If this continues, report it at https://support.kashima.app with the "Desktop" topic!');
        return false;
      }
    }
  }

  async update(force: boolean = false) {
    const folder = this.folders[this.type]
      .replace(/%ROOT/g, process.cwd())
      .replace(/%ID%/g, this.id);

    if (!existsSync(folder)) {
      log('info', `Unable to find folder: ${folder}`);
      dialog.showErrorBox(`Unable to update ${this.type}`, `Seems like you don't have ${this.type} ${this.id} installed? If this keeps reoccuring, please report it at https://support.kashima.app with the "Desktop" topic!`);
    }

    const gitDir = join(folder, '.git');
    if (existsSync(gitDir)) {
      let command = 'git pull --ff-only';
      if (force) {
        const branch = execSync('git branch')
          .toString()
          .split('\n')
          .find(line => line.startsWith('*'))!
          .slice(2)
          .trim();

        command = `git reset --hard origin/${branch}`;
      }

      try {
        execSync(command, { cwd: folder });
      } catch(ex) {
        dialog.showErrorBox('Unknown Error', `Unable to update ${this.type} ${this.id}. If this keeps reoccuring, create a support ticket at https://support.kashima.app!`);
      }
    } else {
      // Download the tarball from the API
      const request = await this.http
        .get('https://api.kashima.app/plugins/tarball', {})
        .query('id', this.id)
        .execute();

      if (!request.successful) dialog.showErrorBox('Http Error', `${this.type.split('').map(x => `${x.slice(0).toUpperCase()}${x.slice(1)}`).join('')} ${this.id} was installed through the application but I was unable to fetch the tarball, is your internet connected?`);

      const homedir = os.homedir();
      const sep = process.platform === 'win32' ? '\\' : '/';

      // Create a ".dump" directory, where the tarballs will be extracted from
      if (!existsSync(`${homedir}${sep}.dump`)) await fs.mkdir(`${homedir}${sep}.dump`);

      // Create a read stream and extract the tarball to $DIR/.dump
      const read = createReadStream(`${this.id}.tar.gz`).pipe(tar.extract({
        strip: 1,
        cwd: `${homedir}${sep}.dump`
      }));

      // Delete the file when were done
      read.on('finish', async () => {
        await fs.unlink(`${homedir}${sep}.dump${sep}${this.id}.tar.gz`);
      });

      // Throw an error when an error occurs
      read.on('error', (error) => {
        dialog.showErrorBox('Extraction Error', 'Unable to extract the tarball.');
        log('error', 'Unable to extract tarball:', error);
      });
    }
  }
}