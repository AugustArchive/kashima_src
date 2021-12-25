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
const PermissionUtil = require('../util/Permissions');
const ThemeModel = require('../structures/models/ThemeModel');
const path = require('path');

const router = new Router('/themes');

// GET /themes
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'none',
    master: false,
    auth: false,
    body: []
  },
  method: 'get',
  route: '/',
  async run(_, res) {
    const all = await ThemeModel.find({}).exec();
    return res.status(200).send({
      statusCode: 200,
      data: all.map(x => ({
        description: x.description,
        repository: x.repository,
        favourites: x.favourites,
        changelog: x.changelog,
        version: x.version,
        tarball: this.isLocalhost() ? null : `https://cdn.kashima.app/themes/${x.version}/${x.tarball}`,
        name: x.name,
        id: x.id
      }))
    });
  }
}));

// GET /themes/:id (get an theme's content from it's id)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'none',
    master: false,
    auth: false,
    body: []
  },
  method: 'get',
  route: '/:id',
  async run(req, res) {
    const theme = await this.database.getTheme(req.params.id);
    if (!theme || theme === null) return res.status(404).send({
      statusCode: 404,
      message: `Theme with id '${req.params.id}' was not found.`
    });

    return res.status(200).send({
      statusCode: 200,
      data: {
        description: theme.description,
        repository: theme.repository,
        favourites: theme.favourites,
        changelog: theme.changelog,
        version: theme.version,
        tarball: this.isLocalhost() ? null : `https://cdn.kashima.app/themes/${theme.id}/${theme.version}/tarball.tar.gz`,
        name: theme.name,
        id: theme.id
      }
    });
  }
}));

// POST /themes/:id (update a post's content)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'jwt',
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
  route: '/:id',
  async run(req, res) {
    const account = await this.database.getAccountByJWT(req.headers.authorization.slice('Bearer '.length));
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });
    
    const theme = await this.database.getTheme(req.params.id);
    if (!theme || theme === null) return res.status(404).send({
      statusCode: 404,
      message: `Skin with id '${req.params.id}' was not found.`
    });

    if (theme.author !== account.username) return res.status(401).send({
      statusCode: 401,
      message: `Account ${account.username} doesn't have the permission to update plugin ${theme.id}`
    });

    for (const [key, val] of Object.entries(req.body.data)) {
      if (!['set', 'push'].includes(key)) return res.status(406).send({
        statusCode: 406,
        message: 'Keys of updating an account must be "set" or "push"'
      });

      if (!(val instanceof Object)) return res.status(406).send({
        statusCode: 406,
        message: 'Values must be an object'
      });

      await this.database.updateTheme(theme.id, key, val);
    }

    return res.status(200).send({
      statusCode: 200
    });
  }
}));

// PUT /themes (create a new plugin)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    optional: false,
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
  method: 'put',
  route: '/',
  async run(req, res) {
    const account = await this.database.getAccountByJWT(req.headers.authorization.slice('Bearer '.length));
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });

    const util = new PermissionUtil(account.permissions.allowed, account.permissions.denied);
    if (!util.has('publish')) return res.status(403).send({
      statusCode: 403,
      message: 'Account doesn\'t have the "publish" permission.'
    });

    const theme = this.database.createTheme({
      author: account.username,
      ...req.body.data
    });

    return res.status(200).send({
      statusCode: 200,
      data: {
        description: theme.description,
        repository: theme.repository,
        favourites: theme.favourites,
        changelog: theme.changelog,
        version: theme.version,
        name: theme.name,
        id: theme.id
      }
    });
  }
}));

// PUT /theme/:id/tarball (Adds a tarball to the server)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    optional: false,
    authType: 'jwt',
    queries: [],
    master: false,
    auth: true,
    body: []
  },
  method: 'put',
  route: '/:id/tarball',
  async run(req, res) {
    const theme = await this.database.getTheme(req.params.id);
    if (!theme || theme === null) return res.status(404).send({
      statusCode: 404,
      message: `Theme with id '${req.params.id}' was not found.`
    });

    if (this.isLocalhost()) return res.status(500).send({
      statusCode: 500,
      message: 'API is in development mode!'
    });

    const file = (require('fs')).createWriteStream(`/var/www/kashima-cdn/themes/${theme.id}/${theme.version}/tarball.tar.gz`);
    let statusCode = 200;
    let error = null;

    req
      .raw
      .on('data', (chunk) => file.write(chunk))
      .on('end', () => file.end())
      .on('error', e => {
        error = e.message;
        statusCode = 500;
      });

    const response = statusCode === 500 ? {
      statusCode,
      message: error
    } : {
      statusCode,
      data: `https://cdn.kashima.app/themes/${theme.id}/${theme.version}/tarball.tar.gz`
    };

    return res.status(statusCode).send(response);
  }
}));

// DELETE /themes/:id (Delete a plugin)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    optional: false,
    authType: 'jwt',
    queries: [],
    master: false,
    auth: true,
    body: []
  },
  method: 'delete',
  route: '/:id',
  async run(req, res) {
    const theme = await this.database.getTheme(req.params.id);
    if (!theme || theme === null) return res.status(404).send({
      statusCode: 404,
      message: `Theme with id '${req.params.id}' was not found.`
    });

    const account = await this.database.getAccountByJWT(req.headers.authorization.slice('Bearer '.length));
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });

    if (theme.owner !== account.username) return res.status(401).send({
      statusCode: 401,
      message: `Account ${account.username} doesn't have the permission to delete plugin ${theme.id}`
    });

    await this.database.deleteTheme(req.params.id);
    return res.status(200).send({ statusCode: 200 });
  }
}));

// GET /themes/:id/tarball (downloads the tarball)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    optional: false,
    authType: 'none',
    master: false,
    auth: false,
    body: []
  },
  method: 'get',
  route: '/:id/tarball',
  async run(req, res) {
    const theme = await this.database.getTheme(req.params.id);
    if (!theme || theme === null) return res.status(404).send({
      statusCode: 404,
      message: `Theme with id '${req.params.id}' was not found.`
    });

    if (this.isLocalhost()) return res.status(500).send({
      statusCode: 500,
      message: 'API is in development mode!'
    });

    const filepath = path.resolve(`/var/www/kashima-cdn/themes/${theme.id}/${theme.version}/tarball.tar.gz`);
    if (path.isAbsolute(filepath)) {
      await res.download(filepath, `${theme.id}.tar.gz`);
    } else {
      return res.status(500).send({ statusCode: 500, message: `Path was not absolute, is theme ${theme.name} (v${theme.version}) published?` });
    }
  }
}));

// GET /themes/popular (Gets the most popular plugins by downloads)
router.addRoute(new Route({
  requirements: {
    parameters: [],
    queries: [],
    optional: false,
    authType: 'none',
    master: false,
    auth: false,
    body: []
  },
  method: 'get',
  route: '/popular',
  async run(_, res) {
    const themes = (await ThemeModel.find({}).exec()).slice(0, 5);
    const all = themes
      .filter(x => x.downloads > 1)
      .map(x => ({
        downloads: Math.max(x.downloads),
        info: {
          description: x.description,
          name: x.name,
          id: x.id
        }
      }));

    return res.status(200).send({
      statusCode: 200,
      data: all
    });
  }
}));

module.exports = router;