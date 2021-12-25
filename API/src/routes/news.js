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
const NewsModel = require('../structures/models/NewsModel');
const utils = require('../util');

const router = new Router('/news');

// GET /news
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
    const allPosts = await NewsModel.find({}).exec();
    return res.status(200).send({
      statusCode: 200,
      data: allPosts.map(x => ({
        createdAt: utils.dateformat(Date.now() - x.createdAt),
        content: x.content,
        author: x.author,
        uuid: x.uuid
      }))
    });
  }
}));

// GET /news/:uuid (get an article's content from it's uuid)
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
  route: '/:uuid',
  async run(req, res) {
    const article = await this.database.getNews(req.params.uuid);
    if (!article || article === null) return res.status(404).send({
      statusCode: 404,
      message: `News article with UUID '${req.params.uuid}' was not found.`
    });

    return res.status(200).send({
      statusCode: 200,
      data: {
        createdAt: article.createdAt,
        content: article.content,
        author: article.author,
        uuid: article.uuid
      }
    });
  }
}));

// POST /news/:uuid (update a post's content)
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
  route: '/:uuid',
  async run(req, res) {
    const account = await this.database.getAccountByJWT(req.headers.authorization.slice('Bearer '.length));
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });
    
    const article = await this.database.getNews(req.params.uuid);
    if (!article || article === null) return res.status(404).send({
      statusCode: 404,
      message: `News article with UUID '${req.params.uuid}' was not found.`
    });

    const util = new PermissionUtil(account.permissions.allowed, account.permissions.denied);
    if (!util.has('editNews')) return res.status(403).send({
      statusCode: 403,
      message: 'Account doesn\'t have the "editNews" permission.'
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

      await this.database.updateNewsArticle(article.uuid, key, val);
    }

    return res.status(200).send({
      statusCode: 200
    });
  }
}));

// PUT /news (create a new post)
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
        name: 'content'
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
    if (!util.has('createNews')) return res.status(403).send({
      statusCode: 403,
      message: 'Account doesn\'t have the "createNews" permission.'
    });

    const article = this.database.createNewsArticle(account.username, req.body.content);
    return res.status(200).send({
      statusCode: 200,
      data: {
        createdAt: article.createdAt,
        content: req.body.content,
        author: account.username,
        uuid: article.uuid
      }
    });
  }
}));

// DELETE /news/:uuid (Delete a news article)
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
  route: '/:uuid',
  async run(req, res) {
    const article = await this.database.getNews(req.params.uuid);
    if (!article || article === null) return res.status(404).send({
      statusCode: 404,
      message: `News article with UUID '${req.params.uuid}' was not found.`
    });

    const account = await this.database.getAccountByJWT(req.headers.authorization.slice('Bearer '.length));
    if (!account || account === null) return res.status(404).send({
      statusCode: 404,
      message: 'No account was found by the JWT token. Is the user account a dud?'
    });

    const util = new PermissionUtil(account.permissions.allowed, account.permissions.denied);
    if (!util.has('deleteNews')) return res.status(403).send({
      statusCode: 403,
      message: 'Account doesn\'t have the "deleteNews" permission.'
    });

    await this.database.deleteNewsArticle(req.params.uuid);
  }
}));

module.exports = router;