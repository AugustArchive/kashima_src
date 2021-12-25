import * as Constants from '../../util/Constants';
import { dirname, resolve } from 'path';
import { render as scss } from 'sass';
import { Application } from '..';
import { existsSync } from 'fs';
import { Updatable } from './Updatable';
import { sep } from '../../util';
import { app } from 'electron';

export interface Stylesheet {
  includes: string[];
  content: string;
}

export default class Theme extends Updatable {
  public applied: boolean = false;
  public info: Constants.Types.ThemeInfo;

  constructor(app: Application, info: Constants.Types.ThemeInfo) {
    super();

    this.info = info;
    this.inject(app);
  }

  get fetchUrl() {
    return `https://api.kashima.app/themes/${this.info.id}`;
  }

  getDownloadUrl() {
    return `https://api.kashima.app/download/theme/${this.info.id}`;
  }

  getFetchUrl() {
    return `https://api.kashima.app/themes/${this.info.id}`;
  }

  getFolder() {
    const root = app.getPath('userData');
    return `${root}${sep}Themes${sep}${this.info.id}`;
  }

  async apply(content: string) {
    this.applied = true;
    const el = document.createElement('style');
    el.id = `skin_${this.info.name}`;

    const find = document.head.querySelector<HTMLStyleElement>(`#skin_${this.info.name}`);
    if (find === null) document.head.appendChild(el);

    const element = find === null ? el : find!;
    const stylesheet = await this._compile(content);

    element.innerHTML = stylesheet.content;
  }

  eject() {
    this.applied = false;
    const element = document.head.querySelector(`#skin_${this.info.name}`);
    if (element) element.remove();
  }

  private async _compile(content: string) {
    const extension = this.info.mainFile.split('.')[1];
    let stylesheet: Stylesheet = {
      content,
      includes: [this.info.mainFile]
    };

    switch (extension) {
      case 'scss': {
        stylesheet = await this._renderSass(content);
      } break;

      default: break;
    }

    return stylesheet;
  }

  private _renderSass(content: string) {
    return new Promise<Stylesheet>((res, rej) => scss({
      includePaths: [dirname(this.info.mainFile)],
      data: content,
      importer: (url, prev) => {
        const u = url.replace('file:///', '');
        if (existsSync(u)) return { file: u };

        const previous = prev === 'stdin' ? this.info.mainFile : prev.replace(/https?:\/\/(?:[a-z]+\.)?discordapp\.com/i, '');
        return {
          file: resolve(dirname(decodeURI(previous)), u).replace(/\\/g, '/')
        };
      }
    }, (error, compiled) => {
      if (error) return rej(error);
      return res({
        content: compiled.css.toString(),
        includes: [
          this.info.mainFile,
          ...compiled.stats.includedFiles.map(f => decodeURI(f).replace(/\\/g, '/').replace(/https?:\/\/(?:[a-z]+\.)?discordapp\.com/i, ''))
        ]
      });
    }));
  }
}