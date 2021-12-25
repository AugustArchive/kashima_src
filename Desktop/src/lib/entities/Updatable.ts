import { dialog, Notification } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { getCommitHash } from '../../util';
import { Application } from '..';
import { execSync } from 'child_process';
import { extract } from '@kashima-org/tar';
import { join } from 'path';
import semver from 'semver';
import os from 'os';

const sep = process.platform === 'win32' ? '\\' : '/';
export abstract class Updatable {
  public updating: boolean = false;
  public app!: Application;

  inject(app: Application) {
    this.app = app;
    return this;
  }

  public abstract getFolder(): string;
  public abstract getDownloadUrl(): string;
  public abstract fetchUrl: string | null;

  public getFetchUrl() {
    return this.fetchUrl;
  }

  async canUpdate() {
    if (this.updating) throw new Error('Updatable is already updating.');

    const folder = this.getFolder();

    if (!existsSync(folder)) {
      log('info', `Unable to find folder ${folder}.`);
      return false;
    }

    const git = join(folder, '.git');
    if (existsSync(git)) {
      execSync('git fetch', { cwd: folder });
      const status = execSync('git status -uno', {
        cwd: folder,
        encoding: 'utf8'
      });

      return status.includes('git pull');
    } else {
      const file = require(join(folder, 'manifest.json'));
      const manifest = JSON.parse(file);
      const url = this.getFetchUrl();
      if (url === null) { // If it's null, then it's the application
        const hash = getCommitHash();
        const res = await this.app.http.request({
          method: 'get',
          url: 'https://api.kashima.app/version'
        }).execute();

        try {
          const data = res.json();
          const commit: string = data['desktop-app'].commitHash;

          if (commit !== hash) return true;
          return false;
        } catch {
          return false;
        }
      }

      const res = await this
        .app
        .http
        .request({
          method: 'get',
          url: url!
        }).execute();

      try {
        const data = res.json();
        if (data.statusCode > 400) return false;
        if (semver.satisfies(data.version, manifest.version)) return false;
        return true;
      } catch {
        return false;
      }
    }
  }

  async update() {
    if (this.updating) throw new Error('Updatable is already updating, give it a few moments');

    const folder = this.getFolder();
    if (!existsSync(folder)) return log('error', 'Unable to find folder');
    if (!existsSync(join(os.homedir(), '.dump'))) mkdirSync(join(os.homedir(), '.dump'));

    this.updating = true;
    const gitDir = join(folder, '.git');
    if (existsSync(gitDir)) {
      try {
        execSync('git pull --ff-only', { cwd: folder });
        this.updating = false;
      } catch(ex) {
        dialog.showErrorBox('Unable to update', 'I was unable to update this package');
        this.updating = false;
      }
    } else {
      const downloadUrl = this.getDownloadUrl();
      await extract({
        dest: `${os.homedir()}${sep}.dump`,
        file: `${os.homedir()}${sep}.dump${sep}package.tar.gz`,
        url: downloadUrl
      }).then(() => {
        this.updating = true;
        const notification = new Notification({
          title: 'Update Avaliable',
          body: 'An update is avaliable, restart the application for any changes!'
        });

        notification.show();
      }).catch((error) => {
        this.updating = true;
        const notification = new Notification({
          title: 'Updating has caused some errors',
          body: 'Sorry for the errors, if this keeps occuring, report it to Support!'
        });

        notification.show();
        log('error', 'Unable to update application', error);
      });

      this.updating = false;
    }
  }
}