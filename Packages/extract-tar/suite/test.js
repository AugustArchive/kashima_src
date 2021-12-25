const { extract } = require('../build');
const { join } = require('path');

const sep = process.platform === 'win32' ? '\\' : '/';
extract({
  dest: `${process.cwd()}${sep}tar`,
  path: join(`${process.cwd()}${sep}tar`, 'npm.tar.gz'),
  url: 'https://registry.npmjs.org/@augu/immutable/-/immutable-0.2.0.tgz'
})
  .then(process.exit)
  .catch(console.error);