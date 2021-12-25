# @kashima-org/installer
> :bath: **| Simple and intuitive installation core for Kashima**

## Usage
```ts
import { Installer, Platform } from '@kashima-org/installer';

const installer = new Installer({
  channels: ['edge', 'stable', 'nightly'],
  platforms: [Platform.Windows, Platform.MacOS, Platform.Linux],
  downloads: {
    edge: '<url to edge tar.gz>',
    stable: '<url to stable tar.gz>',
    nightly: '<url to nightly tar.gz>'
  }
});

const channel = installer.getChannel('edge');
const directory = channel.setDirectory('path/to/custom/directory');

await channel
  .download()
  .then((stats) => console.log(`Installed in ${stats.directory} for channel ${channel.name}!`))
  .catch(console.error);
```

## License
**@kashima/installer** is released under a custom license, read [here](/LICENSE) for more information