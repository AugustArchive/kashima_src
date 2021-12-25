import { Collection } from '@augu/immutable';
import Channel from './models/Channel';
import OS from './models/Platform';

interface InstallerOptions {
  platforms: OS[];
  channels: string[];
  urls: { [x: string]: string };
}
export default class Installer {
  public channels: Collection<Channel>;

  constructor(options: InstallerOptions) {
    this.channels = new Collection();

    const channels = (this.constructor as typeof Installer).validate(options);
    for (const channel of channels) this.channels.set(channel.name, channel);
  }

  static validate(options: InstallerOptions) {
    if (!options.channels.length) throw new Error('You must specify a list of channels');
    if (!options.platforms.length) throw new Error('Specify the operating systems it\'s allowed to be on');

    const channels: Channel[] = [];
    for (const channel of options.channels) {
      if (!options.urls.hasOwnProperty(channel)) throw new Error(`URLs doesn't expose downlaod URL for channel ${channel}`);

      const chan = new Channel({
        downloadUrl: options.urls[channel],
        platforms: options.platforms,
        name: channel
      });

      channels.push(chan);
    }

    return channels;
  }

  setDirectory(name: string, directory: string) {
    if (!this.channels.has(name)) throw new Error(`Channel "${name}" doesn't exist`);

    const channel = this.channels.get(name)!;
    channel.setDirectory(directory);
    
    return this;
  }

  download(name: string) {
    if (!this.channels.has(name)) throw new Error(`Channel "${name}" doesn't exist`);

    const channel = this.channels.get(name)!;
    return channel.download();
  }
}