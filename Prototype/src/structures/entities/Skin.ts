import { dirname, resolve } from 'path';
import { render as scss } from 'sass';
import { existsSync } from 'fs';
import { Updatable } from './Updatable';
import { Types } from '../../util/Constants';

interface CompiledStylesheet {
  includes: string[];
  data: string;
}

export class Skin extends Updatable {
  /** If the skin has been applied */
  public applied: boolean;

  /** The information from the skin's `manifest.json` file */
  public info: Types.SkinInfo;

  /**
   * Creates a new `Skin` class
   * @param app The application instance
   * @param info The information from the skin's `manifest.json` file
   */
  constructor(info: Types.SkinInfo) {
    super('skin', info.id);

    this.applied = false;
    this.info = info;
  }

  async apply(content: string) {
    this.applied = true;
    const element = document.createElement('style');
    element.id = `skin_${this.info.name}`;

    const find = document.head.querySelector<HTMLStyleElement>(`skin_${this.info.name}`);
    if (find === null) document.head.appendChild(element);

    const el = find === null ? element : find!;
    const stylesheet = await this.compileStyles(content);

    el.innerHTML = stylesheet.data;
  }

  eject() {
    this.applied = false;
    const element = document.head.querySelector(`#skin_${this.info.name}`);
    if (element) element.remove();
  }

  private async compileStyles(content: string) {
    const ext = this.info.mainFile.split('.')[1];
    let css: CompiledStylesheet = {
      data: content,
      includes: [this.info.mainFile]
    };

    switch (ext) {
      case 'scss': return css = await this.renderSass(content);
      case 'css': return css = {
        data: content,
        includes: [this.info.mainFile]
      };
      default: break;
    }

    return css;
  }

  private renderSass(content: string) {
    return new Promise<CompiledStylesheet>((res, rej) => scss({
      data: content,
      includePaths: [dirname(this.info.mainFile)],
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
        data: compiled.css.toString(),
        includes: [
          this.info.mainFile,
          ...compiled.stats.includedFiles.map(f => decodeURI(f).replace(/\\/g, '/').replace(/https?:\/\/(?:[a-z]+\.)?discordapp\.com/i, ''))
        ]
      });
    }));
  }
}