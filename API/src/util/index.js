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

const { createHash } = require('crypto');
const Dateformat = require('./Dateformat');

const _sep = process.platform === 'win32' ? '\\' : '/';

module.exports = {
  /**
   * Formats the paths to a directory string
   * @param {string[]} paths The paths to join to
   */
  getArbitrayPath(...paths) {
    return `${process.cwd()}${_sep}${paths.join(_sep)}`;
  },

  /** Utility class for permission handling */
  Permissions: require('./Permissions'),

  /** List of constants used */
  Constants: require('./Constants'),

  /**
   * Parses a date and returns a humanizable date from it's `mask`
   * @param {Date | number} date The date to convert
   * @param {string} [mask] The mask to use
   */
  dateformat: (date, mask = 'mm/dd/yyyy hh:MM:ss TT') => new Dateformat(date).parse(mask),
  /**
   * Returns a Gravatar URL for avatars
   * @param {string} email The email to get the avatar from
   */
  gravatar: (email) => {
    const hash = createHash('md5')
      .update(email.trim().toLowerCase())
      .digest('hex');

    return `https://secure.gravatar.com/avatar/${hash}`;
  },

  /**
   * Pauses the event loop until the resolved timeout is done.
   * 
   * This happens since JavaScript (espically Node.js) has an event loop that
   * runs all of the synchronous code, then promises, then finally
   * resolve all setTimeout/setIntervals.
   * 
   * A promise is a macrotask, which resolves first after the synchronous code
   * is finished running. setTimeout/setIntervals are microtasks that run last
   * after [a]synchronous code is done.
   * 
   * @param {number} duration The duration to pause the event loop
   * @returns {Promise<unknown>} The promise itself to do `await sleep(5000)`
   */
  sleep: (duration) => new Promise((resolve) => setTimeout(resolve, duration)),

  /** Returns a marker of the split path for the corresponding system */
  sep: _sep
};