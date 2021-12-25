const platform = builder.Platform;
const builder = require('electron-builder');
const leeks = require('leeks.js');

const log = (...message) => {
  const level = leeks.colors.bgBlue('  INFO  ');
  const msg = message.map(x => x instanceof Object ? (require('util')).inspect(x) : x).join('\n');

  process.stdout.write(`${level} | ${msg}`);
};

const windows = builder.build({
  targets: platform.WINDOWS.createTarget(),
  config: {
    target: 'nsis',
    copyright: `Copyright (c) LiquidBlast 2018-${new Date().getFullYear()}`,
    publisherName: 'LiquidBlast',
    extraFiles: ['app/**', 'dist/**', 'public/**']
  }
});

const linux = builder.build({
  targets: platform.LINUX.createTarget(),
  config: {
    target: ['deb', 'rpm', 'tar.gz'],
    category: 'Audio',
    vendor: 'LiquidBlast',
    copyright: `Copyright (c) LiquidBlast 2018-${new Date().getFullYear()}`,
    extraFiles: ['app/**', 'dist/**', 'public/**']
  }
});

const macos = builder.build({
  targets: platform.MAC.createTarget(),
  config: {
    appId: 'app.kashima.desktop',
    target: 'dmg',
    copyright: `Copyright (c) LiquidBlast 2018-${new Date().getFullYear()}`,
    extraFiles: ['app/**', 'dist/**', 'public/**'],
    category: 'public.app-category.music'
  }
});

const main = async () => {
  try {
    const [winLib, linuxLib, macLib] = await Promise.all([
      windows,
      linux,
      macos
    ]);
  
    const binaries = [].concat(winLib, linuxLib, macLib);
    log(`Built ${binaries.length} distributions for Windows, MacOS, and Linux.`);
  
    while (binaries.length > 0) {
      const binary = binaries.shift();
      log(`Binary ${binary} was built.`);
    }
  
    return { success: true, code: 0 };
  } catch {
    return { success: false, code: 1 };
  }
};

(async function () {
  const { code } = await main();
  process.exit(code);
})();