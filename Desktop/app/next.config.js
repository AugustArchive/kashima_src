const { join } = require('path');

/**
 * Next.js configuration
 */
module.exports = {
  sassOptions: {
    includes: [join(__dirname, 'styles')]
  },
  webpack: (config) => {
    config.resolve = { ...config.resolve };
    return Object.assign(config, {
      target: 'electron-renderer'
    });
  }
};