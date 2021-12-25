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

const { Permissions } = require('./Constants');

module.exports = class Permission {
  /**
   * Creates a new instance of the `Permission` class
   * @param {number} allow Integer of allowed permissions
   * @param {number} [deny] Integer of denied permissions
   */
  constructor(allow, deny = 0) {
    /**
     * Integer of allowed permissions
     */
    this.allowed = allow;

    /**
     * Integer of denied permissions
     */
    this.denied = deny;

    /**
     * Formatted permissions to a JSON-like structure
     * 
     * i.e:
     * 
     * ```json
     * {
     *   "publish": true,   // allowed
     *   "editNews": false  // not allowed
     * }
     * ```
     */
    this.json = this.format();
  }

  /**
   * Private function to format all permissions to a JSON-like structure
   * 
   * i.e:
   * 
   * ```json
   * {
   *   "publish": true,   // allowed
   *   "editNews": false  // not allowed
   * }
   * ```
   * 
   * @returns {{ [x: string]: boolean }} Object that represents the above structure
   */
  format() {
    const json = {};
    for (const perm of Object.keys(Permissions)) {
      json[perm] = !!(this.allowed & Permissions[perm]);
    }

    return json;
  }

  /**
   * Checks if the permission is valid
   * @param {string} perm The permission to check
   */
  has(perm) {
    const int = Permissions[perm];
    return !!(this.allowed & int);
  }
};