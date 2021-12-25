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

const { Router, Route } = require('../structures/Routing');
const crypto = require('crypto');
const utils = require('../util');
const JWT = require('../util/JWT');

const router = new Router('/accounts');

// GET /accounts
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [
      {
        required: true,
        name: 'username'
      }
    ],
    optional: true,
    authType: 'none',
    master: true,
    auth: false,
    body: []
  },
  method: 'get',
  route: '/',
  async run(req, res) {
    const account = await this.database.getAccount('username', req.query.username);
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: `Account with username '${req.query.username}' doesn't exist?`
    });

    const friends = await Promise.all(account.friends.map(x => this.database.getAccount('username', x)));
    const followers = await Promise.all(account.followers.map(x => this.database.getAccount('username', x)));
    const following = await Promise.all(account.following.map(x => this.database.getAccount('username', x)));

    if (account.jwt === null) {
      const jwtToken = JWT.encode(account.username, account.password);
      await this.database.updateAccount(account.username, 'set', {
        jwt: jwtToken
      });
    }

    const token = JWT.decode(account.jwt);
    if (token.error && token.error.includes('has expired')) {
      const jwtToken = JWT.encode(account.username, account.password);
      await this.database.updateAccount(account.username, 'set', {
        jwt: jwtToken
      });
    }

    // Check if the authorization header exists, if so, check for `Bearer` and `Account` prefixes or check if the header is equal to the master key
    const key = !req.headers.hasOwnProperty('authorization') 
      ? false 
      : req.headers['authorization'].split(' ')[0] === 'Bearer' || req.headers['authorization'].split(' ')[0] === 'Account'
        ? true
        : req.headers['authorization'] === this.config.masterKey;

    const data = !key ? {
      blockedUsers: account.blockedUsers,
      permissions: account.permissions,
      description: account.description,
      following: following.map(x => ({
        avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
        username: x.username,
        status: x.status
      })),
      followers: followers.map(x => ({
        avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
        username: x.username,
        status: x.status
      })),
      avatarUrl: account.connections.gravatar !== null ? utils.gravatar(account.connections.gravatar) : account.avatarUrl,
      username: account.username,
      friends: friends.map(x => ({
        avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
        username: x.username,
        status: x.status
      })),
      badges: account.badges
    } : {
      blockedUsers: account.blockedUsers,
      permissions: account.permissions,
      description: account.description,
      following: following.map(x => ({
        avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
        username: x.username,
        status: x.status
      })),
      followers: followers.map(x => ({
        avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
        username: x.username,
        status: x.status
      })),
      avatarUrl: account.connections.gravatar !== null ? utils.gravatar(account.connections.gravatar) : account.avatarUrl,
      username: account.username,
      friends: friends.map(x => ({
        avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
        username: x.username,
        status: x.status
      })),
      status: account.status,
      badges: account.badges,
      token: account.token,
      email: account.email,
      salt: account.salt,
      jwt: account.jwt
    };

    return res.status(200).send({
      statusCode: 200,
      data
    });
  }
}));

// POST /accounts/login
router.addRoute(new Route({
  requirements: {
    parameters: [],
    authType: 'none',
    queries: [],
    master: true,
    auth: false,
    body: [
      {
        required: true,
        name: 'username'
      },
      {
        required: true,
        name: 'password'
      }
    ]
  },
  method: 'post',
  route: '/login',
  async run(req, res) {
    // TODO: Add email authenication
    const account = await this.database.getAccount('username', req.body.username);
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: `Account by ${req.body.username} doesn't exist.`
    });

    // Encrypt the token with the salted value provided
    const password = crypto.pbkdf2Sync(req.body.password, account.salt, 100000, 32, 'sha256').toString('hex');
    if (password !== account.password) return res.status(401).send({
      statusCode: 401,
      message: 'Invalid password.'
    });

    const friends = await Promise.all(account.friends.map(x => this.database.getAccount('username', x)));
    const followers = await Promise.all(account.followers.map(x => this.database.getAccount('username', x)));
    const following = await Promise.all(account.following.map(x => this.database.getAccount('username', x)));

    return res.status(200).send({
      statusCode: 200,
      data: {
        blockedUsers: account.blockedUsers,
        permissions: account.permissions,
        description: account.description,
        following: following.map(x => ({
          avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
          username: x.username,
          status: x.status
        })),
        followers: followers.map(x => ({
          avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
          username: x.username,
          status: x.status
        })),
        avatarUrl: account.connections.gravatar !== null ? utils.gravatar(account.connections.gravatar) : account.avatarUrl,
        username: account.username,
        friends: friends.map(x => ({
          avatarUrl: x.connections.gravatar !== null ? utils.gravatar(x.connections.gravatar) : x.avatarUrl,
          username: x.username,
          status: x.status
        })),
        status: account.status,
        badges: account.badges,
        token: account.token,
        email: account.email,
        salt: account.salt,
        jwt: account.jwt
      }
    });
  }
}));

// POST /accounts (updating the account)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    authType: 'jwt',
    queries: [],
    master: false,
    auth: true,
    body: [
      {
        required: true,
        name: 'data'
      }
    ]
  },
  method: 'post',
  route: '/',
  async run(req, res) {
    const token = JWT.decode(req.headers.authorization.split(' ')[1]);
    const account = await this.database.getAccount('username', token.username);
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: `Account by ${req.body.username} doesn't exist.`
    });

    for (const [key, value] of Object.entries(req.body.data)) {
      if (!['set', 'push'].includes(key)) return res.status(406).send({
        statusCode: 406,
        message: 'Keys of updating an account must be "set" or "push"'
      });

      if (!(value instanceof Object)) return res.status(406).send({
        statusCode: 406,
        message: 'Values must be an object'
      });

      await this.database.updateAccount(account.username, key, value);
    }

    return res.status(200).send({
      statusCode: 200
    });
  }
}));

// POST /accounts/jwt
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'account',
    auth: true,
    body: []
  },
  method: 'post',
  route: '/jwt',
  async run(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    const account = await this.database.getAccountByToken(token);

    const jwtToken = JWT.encode(account.username, account.password);
    await this.database.updateAccount(account.username, 'set', {
      jwt: jwtToken
    });

    return res.status(200).send({
      statusCode: 200,
      token: jwtToken
    });
  }
}));

// POST /accounts/jwt/validate
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'jwt',
    auth: false,
    master: false,
    body: []
  },
  method: 'post',
  route: '/jwt/validate',
  async run(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    const account = await this.database.getAccountByJWT(token);
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });

    const decoded = JWT.decode(token);
    if (decoded.error) return res.status(500).send({
      statusCode: 500,
      message: decoded.error
    });

    return res.status(200).send({
      statusCode: 200,
      data: {
        username: decoded.username
      }
    });
  }
}));

// POST /accounts/jwt/refresh
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'jwt',
    auth: false,
    master: false,
    body: []
  },
  method: 'post',
  route: '/jwt/refresh',
  async run(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    const account = await this.database.getAccountByJWT(token);
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });

    const decoded = JWT.decode(token);

    // If the token has expired
    if (decoded.error === 'Token has expired.') {
      const token = JWT.encode(account.username, account.password);
      await this.database.updateAccount(account.username, 'set', { jwt: token });
      return res.status(200).send({
        statusCode: 200,
        data: {
          token
        }
      });
    } else if (decoded.error === null) {
      return res.status(401).send({
        statusCode: 401,
        message: 'Token has not expired.'
      });
    } else {
      return res.status(500).send({
        statusCode: 500,
        message: `Unable to validate the token: ${decoded.error}`
      });
    }
  }
}));

// PUT /accounts (create new account)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    authType: 'master',
    queries: [],
    master: false,
    auth: false,
    body: [
      {
        required: true,
        name: 'username'
      },
      {
        required: true,
        name: 'password'
      },
      {
        required: true,
        name: 'email'
      }
    ]
  },
  method: 'put',
  route: '/',
  async run(req, res) {
    // Check if the email exists
    const acc1 = await this.database.getAccount('email', req.body.email);
    if (acc1) return res.status(500).send({
      statusCode: 500,
      message: `Email ${req.body.email} exists`
    });

    // Check if the username exists
    const acc2 = await this.database.getAccount('username', req.body.username);
    if (acc2) return res.status(500).send({
      statusCode: 500,
      message: `Username ${req.body.username} exists`
    });

    // TODO: Add verify email stuff
    const account = this.database.createAccount(req.body.username, req.body.email, req.body.password);
    return res.status(200).send({
      statusCode: 200,
      data: {
        blockedUsers: account.blockedUsers,
        permissions: account.permissions,
        description: account.description,
        following: [],
        followers: [],
        avatarUrl: account.connections.gravatar !== null ? utils.gravatar(account.connections.gravatar) : account.avatarUrl,
        username: account.username,
        friends: [],
        status: account.status,
        badges: account.badges,
        token: account.token,
        email: account.email,
        salt: account.salt,
        jwt: account.jwt
      }
    });
  }
}));

// DELETE /accounts (delete an account)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    authType: 'none',
    queries: [],
    master: true,
    auth: false,
    body: [
      {
        required: true,
        name: 'username'
      }
    ]
  },
  method: 'delete',
  route: '/',
  async run(req, res) {
    const account = await this.database.getAccount('username', req.body.username);
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: `No account by ${req.body.username} exists.`
    });

    await this.database.deleteAccount(req.body.username);
    return res.status(200).send({
      statusCode: 200
    });
  }
}));

module.exports = router;