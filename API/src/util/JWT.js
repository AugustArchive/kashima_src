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

const Dateformat = require('./Dateformat');
const { secret } = require('../config.json');
const jwt = require('jsonwebtoken');

//? Credit: https://github.com/powercord-org/powercord-backend/blob/master/src/util/jwt.js
module.exports = {
  /**
   * Generate a JWT string to authenicate with
   * @param {string} username The username
   * @param {string} password The password
   */
  encode: (username, password) => jwt.sign({ username, password }, secret, { algorithm: 'HS512', expiresIn: '7 days' }),

  /**
   * Decodes a JWT string and return an object of the user's username and password
   * @param {string} token The JWT token to decode
   * @return {{ error: string | null; username: string; }} Object of the result
   */
  decode: (token) => {
    try {
      const value = jwt.verify(token, secret, { algorithms: ['HS512'] });
      return { 
        error: null, 
        username: value.username
      };
    } catch(ex) {
      if (ex instanceof jwt.JsonWebTokenError) return { error: 'Token is invalid.', username: null };
      else if (ex instanceof jwt.TokenExpiredError) return { error: 'Token has expired.', username: null };
      else return { error: ex.message, username: null };
    }
  }
};