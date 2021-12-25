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

const { HttpClient, middleware } = require('@augu/orchid');
const { promises: fs } = require('fs');
const { Collection } = require('@augu/immutable');
const getCommitHash = require('./functions/getCommitHash');
const { Router } = require('./Routing');
const onRequest = require('./functions/onRequest');
const versions = require('../assets/versions.json');
const Database = require('./Database');
const fastify = require('fastify');
const Logger = require('./Logger');
const utils = require('../util');

module.exports = class Server {
  /**
   * Creates a new `Server` instance
   * @param {Configuration} config The configuration used in the `config.json` file
   */
  constructor(config) {
    /** How many requests we have throttled */
    this.requests = 0;

    /** The database itself */
    this.database = new Database(config.dbUrl);

    /**
     * The routers list
     * @type {Collection<import('./Routing').RouterBase>}
     */
    this.routers = new Collection();

    /** The logger */
    this.logger = new Logger('Server');
    
    /** The configuration */
    this.config = config;

    /** The http client */
    this.http = new HttpClient();

    /** The fastify instance */
    this.app = fastify();
  }

  isLocalhost() {
    return this.config.environment === 'development';
  }

  /**
   * Function to register the middleware
   */
  addMiddleware() {
    this.app.register(require('fastify-cors'), { exposedHeaders: 'Content-Disposition' }); // Implement CORS
    this.app.register(require('fastify-no-icon')); // Don't register an icon
    this.app.register(require('../middleware/download')); // Implement "res.download()"

    // Ratelimit middleware (~50 requests per minute)
    this.app.register(require('fastify-rate-limit'), {
      timeWindows: '1 minute',
      max: 50
    });

    // Override the "application/json" parser
    this.app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_, body, done) => {
      try {
        const data = JSON.parse(body.toString());
        done(null, data);
      } catch(ex) {
        ex.statusCode = 500;
        this.logger.error('Unable to parse JSON', ex);
        done(ex, undefined);
      }
    });

    // Implement our own error handler
    this.app.setErrorHandler((error, _, reply) => {
      this.logger.error('Received an error while processing a request:', error);

      reply.status(500).send({
        statusCode: 500,
        message: 'Unable to fulfill your request.',
        error: error.message
      });
    });

    // Implement our own 404 handler
    this.app.setNotFoundHandler((request, reply) => {
      this.logger.warn(`Route "${request.raw.method.toUpperCase()} ${request.req.url}" was not found.`);

      reply.status(404).send({
        statusCode: 404,
        message: `Route ${request.raw.method.toUpperCase()} ${request.req.url} was not found. Are you lost?`
      });
    });

    // Add middleware to Orchid
    this
      .http
      .use(middleware.logging({
        binding: (level, message) => this.logger[level](message)
      }));
  }

  /**
   * Builds all of the routers
   */
  async buildRoutes() {
    const cwd = utils.getArbitrayPath('routes');
    const files = await fs.readdir(cwd);

    if (!files.length) {
      this.logger.warn(`Missing routes in "${cwd}" Does it exist?`);
      process.exit(1);
    }
    
    this.logger.info(`Now loading ${files.length} routes...`);
    for (const file of files) {
      /** @type {import('./Routing').RouterBase} */
      const router = require(utils.getArbitrayPath('routes', file));

      if (!(router instanceof Router)) {
        this.logger.warn('Router was not an class instance, skipping...');
        continue;
      }

      this.routers.set(router.route, router);
      for (const route of router.routes.values()) {
        this.logger.info(`Registering "onRequest" hook for route: ${route.method.toUpperCase()} ${route.route}`);
        this.app[route.method](route.route, (req, res) => onRequest(this, route, req, res));
      }

      this.logger.info(`Built router ${file.split('.')[0]}`);
    }
  }

  /**
   * Edit the commit hashes in "assets/versions.json"
   */
  async editHashes() {
    if (this.config.environment === 'development') {
      const repos = ['desktop-app', 'website', 'mobile-app'];

      for (const repo of repos) {
        this.logger.info(`Editing hash for '${repo}'...`);
        const commit = getCommitHash(this.http, repo);
        versions[repo] = commit;
      }
  
      this.logger.info('Gotten all hashes! Now writing to the filesystem...');
      await fs.writeFile(utils.getArbitrayPath('assets', 'versions.json'), JSON.stringify(versions, null, 2));  
    }  
  }

  /**
   * Runs the server
   */
  async run() {
    this.logger.info('Now running the server...');
    await utils.sleep(2000);

    this.logger.info('Building middleware...');
    this.addMiddleware();

    this.logger.info('Built middleware! Now building routes...');
    await this.buildRoutes();

    this.logger.info('Built all routes! Now connecting to MongoDB...');
    await this.database.connect();

    this.logger.info('Connected to MongoDB! Editing commit hashes...');
    await this.editHashes();

    this.logger.info('Edited commit hashes for "assets/versions.json"! Now waiting 2 seconds...');
    await utils.sleep(2000);

    this.app.listen(this.config.port, (error) => 
      error ? this.logger.error('Unable to build fastify instance:', error) : this.logger.info(`Now listening at: http://localhost:${this.config.port}`)
    );
  }
};

/**
 * @typedef {object} Configuration
 * @prop {'development' | 'production'} environment The environment of the API
 * @prop {string} masterKey The master key
 * @prop {string} secret The secret to use when encoding JWT tokens
 * @prop {string} dbUrl The database URL
 * @prop {number} port The port to use
 */