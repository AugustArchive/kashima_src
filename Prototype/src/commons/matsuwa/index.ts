import { Plugin } from './entities/Plugin';
import * as utils from './util';
import * as http from './http';

// Add ES6 exports
const version: string = '1.1.0';
export { http, utils, Plugin, version };

// Fallback for ES5 or lower
module.exports = {
  utils,
  http,
  Plugin,
  version
};