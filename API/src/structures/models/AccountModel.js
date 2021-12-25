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
  username: String,
  password: String,
  token: String,
  salt: String,
  email: String,
  jwt: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  avatarUrl: {
    type: String,
    default: 'https://cdn.kashima.app/default.jpg'
  },
  following: {
    type: Array,
    default: []
  },
  followers: {
    type: Array,
    default: []
  },
  badges: {
    type: Array,
    default: []
  },
  friends: {
    type: Array,
    default: []
  },
  blockedUsers: {
    type: Array,
    default: []
  },
  friends: {
    type: Array,
    default: []
  },
  status: {
    current: {
      type: String,
      default: 'offline'
    },
    song: {
      type: String,
      default: null
    }
  },
  connections: {
    gravatar: {
      type: String,
      default: null
    }
  },
  permissions: {
    allowed: {
      type: Number,
      default: 0
    },
    denied: {
      type: Number,
      default: 0
    }
  }
});

/**
 * Gets the account model schema
 * @type {import('mongoose').Model<AccountModel, {}>} The newly created model
 */
module.exports = model('accounts', schema, 'accounts');

/**
 * @typedef {object} AccountModel
 * @prop {string[]} blockedUsers An array of users that user has blocked
 * @prop {AccountConnections} connections Any connections
 * @prop {AccountPermissions} permissions An object of all of the user's permissions
 * @prop {string} description Description of themselves
 * @prop {string[]} following A list of username that the user is following
 * @prop {string[]} followers A list of username that are following the user
 * @prop {boolean} activated If the user has activated their account
 * @prop {string} avatarUrl The avatar URL to use
 * @prop {string} username The username
 * @prop {boolean} disabled If the user's account was disabled by an admin
 * @prop {string} password The password they setted when signing up, but encoded differently
 * @prop {string[]} friends An array of friends by their usernames
 * @prop {AccountStatus} status The status
 * @prop {string[]} badges A list of badges the user has
 * @prop {string} token Token for account authenication
 * @prop {string} email The email they used when signing up
 * @prop {string} salt The salted hash code for the password
 * @prop {string} jwt The JWT token (request one to "POST /accounts/jwt")
 * 
 * @typedef {object} AccountStatus
 * @prop {'online' | 'offline' | 'listening'} current The status type
 * @prop {{ artist: string; title: string; }} song The song that is playing
 * 
 * @typedef {object} AccountConnections
 * @prop {string} gravatar The gravatar connection
 * 
 * @typedef {object} AccountPermissions
 * @prop {number} allowed An integer of allowed permissions
 * @prop {number} denied An integer of denied permissions
 */