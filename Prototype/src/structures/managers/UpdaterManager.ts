import { createWriteStream, existsSync, promises as fs, write, createReadStream } from 'fs';
import { Application } from '../Application';
import { resolve } from 'path';
import { http } from 'matsuwa';
import electron, { dialog } from 'electron';
import tar from 'tar';

export default class UpdaterManager {
  public http: http.HttpClient;
  public app: Application;

  constructor(app: Application) {
    this.http = new http.HttpClient();
    this.app = app;
  }

  // Private function until we hit beta stages
  private async checkForUpdates() {
    const Platforms = ['win32', 'darwin'];
    if (!electron.app.isPackaged || !Platforms.includes(process.platform)) {
      const message = electron.app.isPackaged === false ?
        'Application was not packaged, cannot perform updates.' :
        'Operating System was not Windows or MacOS.';

      log('warn', message);
      return;
    }

    const req = await this.http.get('https://api.kashima.app/version', {}).execute();
    if (!req.successful) {
      log('error', 'Request to fetch the version was not a success.');
      return;
    }

    const data = req.json();
    const version: string = data['desktop-app'].version;

    const appVersion = electron.app.getVersion();
    if (appVersion >= version) {
      electron.dialog.showMessageBox(this.app.window!, {
        title: 'No updates',
        message: `Your application is already updated! (v${appVersion})`
      });

      return;
    }

    const notifier = new electron.Notification({
      title: 'Update Avaliable',
      body: `A new version is avaliable to update! Click me to update from ${appVersion} -> ${version}`
    });

    const onUpdate = async() => {
      if (!Platforms.includes(process.platform)) return;

      const path = resolve(electron.app.getPath('temp'), 'kashima.tar.gz');
      if (existsSync(path)) await fs.unlink(path);

      const req = await this.http.get('https://api.kashima.app/download', {}).execute();

      if (!req.successful) {
        log('warn', 'Unable to update the application.');
        return;
      }

      const writer = createWriteStream(path);
      const stream = req.stream();
      stream.pipe(writer);

      const writerPromise = new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      writerPromise
        .then(async () => {
          const stream = createReadStream(path);
          stream.pipe(tar.x({
            strip: 1,
            C: electron.app.getPath('temp')
          }));
        }).catch(error => {
          log('error', 'Unable to create file', error);
          dialog.showErrorBox('Update was not successful', 'I was unable to create a "kashima.tar.gz" file, do you have enough ram?');
          return;
        });
    };

    notifier.once('click', onUpdate);
    notifier.show();
  }
}