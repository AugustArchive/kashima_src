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
const platforms = require('../assets/versions.json');
const router = new Router('/');
const pkg = require('../../package.json');

// GET /
router.addRoute(new Route({
  requirements: {
    authType: 'none',
    master: false,
    auth: false
  },
  method: 'get',
  route: '/',
  run(_, res) {
    return res
      .status(200)
      .send({
        statusCode: 200,
        message: 'Welcome to the Kashima API! Read more about our API here: https://docs.kashima.app/api'
      });
  }
}));

// GET /version
router.addRoute(new Route({
  requirements: {
    authType: 'none',
    master: false,
    auth: false
  },
  method: 'get',
  route: '/version',
  run(_, res) {
    return res
      .status(200)
      .send({
        statusCode: 200,
        data: platforms
      });
  }
}));

// GET /stats
router.addRoute(new Route({
  requirements: {
    authType: 'none',
    master: false,
    auth: false
  },
  method: 'get',
  route: '/stats',
  async run(_, res) {
    const count = await this.database.count();

    return res
      .status(200)
      .send({
        statusCode: 200,
        data: {
          accounts: count.accounts,
          articles: count.articles,
          requests: this.requests,
          version: `v${pkg.version}`,
          themes: count.themes
        }
      });
  }
}));

module.exports = router;