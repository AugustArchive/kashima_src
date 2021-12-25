import OperatingSystem, { isAvaliable } from './Platform';
import { EventEmitter } from 'events';
import Stopwatches from '../util/Stopwatch';
import { extract } from '@kashima-org/tar';
import { join } from 'path';

interface ChannelOptions {
  downloadUrl: string;
  directory?: string;
  platforms: OperatingSystem[];
  name: string;
}

/**
 * Representation of a "channel" to install the application in
 */
export default class Channel extends EventEmitter {
  /** The download URL */
  public downloadUrl: string;

  /** The stopwatch container */
  private container: Stopwatches;

  /** The directory to install it in */
  public directory?: string;

  /** The suited platforms for it */
  public platforms: OperatingSystem[];

  /** The channel name */
  public name: string;

  /**
   * Constructs a new Channel instance
   * @param options The channel options
   */
  constructor(options: ChannelOptions) {
    super();

    this.downloadUrl = options.downloadUrl;
    this.container = new Stopwatches();
    this.directory = options.directory;
    this.platforms = options.platforms;
    this.name = options.name;
  }

  /**
   * Sets the directory to install it in
   * @param directory The directory
   */
  setDirectory(dir: string) {
    this.directory = dir;
    return this;
  }

  /**
   * Installs the package
   * @returns The time the package built
   */
  async download() {
    const stopwatch = this.container.start();

    if (this.directory === undefined) {
      const time = this.container.end(stopwatch);
      throw new Error(`Directory is non existant (${time}ms)`);
    }

    if (this.platforms.some(x => !isAvaliable(x))) {
      const time = this.container.end(stopwatch);
      throw new Error(`Operating System is not a valid operating system the channel has set (${time}ms)`);
    }

    try {
      await extract({
        dest: this.directory,
        // @ts-ignore
        path: join(this.directory, 'temp.tar.gz'),
        url: this.downloadUrl
      });

      const time = this.container.end(stopwatch);
      return time;
    } catch(ex) {
      const time = this.container.end(stopwatch);
      throw new Error(`${ex.message} (${time}ms)`);
    }
  }
}