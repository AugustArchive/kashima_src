/*
 * Copyright (c) 2019-2020 LiquidBlast
 * 
 * All code contained in this software ("Software") is copyrighted by LiquidBlast and 
 * may not be used outside this project without written permission from LiquidBlast. Art 
 * assets and libraries are licensed by their respective owners.
 * 
 * Permission is hearby granted to use the Software under the following terms and conditions:
 * * You will not attempt to reverse engineer or modify the Software.
 * * You will not sell or distribute the Software under your own name without written permission 
 *   from LiquidBlast.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { Schema, model } = require('mongoose');

const schema = new Schema({
  description: String,
  author: String,
  name: String,
  id: String,
  repository: {
    type: String,
    default: null
  },
  favourites: {
    type: Number,
    default: 0
  },
  changelog: {
    type: Array,
    default: []
  },
  tarball: {
    type: String,
    default: null
  },
  version: {
    type: String,
    version: '1.0.0'
  },
  preprocessor: {
    type: String,
    default: null
  },
  authors: {
    type: Array,
    default: []
  },
  downloads: {
    type: Number,
    default: 0
  },
  contributors: {
    type: Array,
    default: []
  }
});

/**
 * Model for themes
 * @type {import('mongoose').Model<ThemeModel, {}>}
 */
module.exports = model('themes', schema, 'themes');

/**
 * @typedef {object} ThemeModel
 * @prop {'css' | 'sass' | 'less' | 'stylus'} preprocessor The process to compile the theme from
 * @prop {string[]} contributors A list of contributors 
 * @prop {string} description The theme's description
 * @prop {string} repository The theme's repository URL
 * @prop {number} favourites Number of favourites the plugin has
 * @prop {Changelog[]} changelog The plugin's changelog
 * @prop {number} downloads The amount of downloads
 * @prop {string} tarball The tarball to extract from
 * @prop {string[]} authors The authors of the theme
 * @prop {string} version The version of the theme
 * @prop {string} owner The owner of the theme (has delete perms)
 * @prop {string} name The theme's name
 * @prop {string} id The theme's ID (i.e: `august.uwu-addon` or `dev.august.uwu-addon`)
 * 
 * @typedef {object} Changelog
 * @prop {boolean} prerelease If the changelog isn't ready for production
 * @prop {string} version The changelog version
 * @prop {string} content The markdown version of the content
 */