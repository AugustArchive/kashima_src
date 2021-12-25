const { Installer, Platform } = require('../build');
const installer = new Installer({
  channels: ['test'],
  platforms: [Platform.Windows],
  urls: {
    test: 'https://registry.npmjs.org/@augu/orchid/-/orchid-1.0.0.tgz'
  }
});

installer
  .setDirectory('test', './test')
  .download('test')
  .then((time) => console.log(`Took ${time}ms`))
  .catch(console.error);