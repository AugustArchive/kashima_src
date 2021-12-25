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

const { Collection } = require('@augu/immutable');
const crypto = require('crypto');

class Route {
  /**
   * Creates a new `Route` instance
   * @param  {RouteOptions} options The route options to use
   */
  constructor(options) {
    /**
     * A list of requirements the request needs to surpass
     * @type {RouteRequirements}
     */
    this.requirements = options.hasOwnProperty('requirements') ? options.requirements : {
      parameters: [],
      optional: false,
      authType: 'none',
      master: false,
      queries: [],
      auth: false
    };

    /** The function to run the route */
    this.callee = options.run;

    /** The method to use */
    this.method = options.method;

    /** The route itself */
    this.route  = options.route;
  }
}

class Router {
  /**
   * Creates a new `Router` instance
   * @param {string} route The route to use
   */
  constructor(route) {
    /**
     * All of the routes
     * @type {Collection<Route>}
     */
    this.routes = new Collection();

    /** The route for the router (the path is updated when the route is injected) */
    this.route = route;
  }

  /**
   * Adds a route
   * @param {Route} route The route to add
   */
  addRoute(route) {
    const path = route.route === '/' ? this.route : `${this.route === '/' ? '' : this.route}${route.route}`;
    route.route = path;

    const id = crypto.randomBytes(6).toString('hex');
    this.routes.set(id, route);
    return this;
  }
}

module.exports = {
  Router,
  Route
};

// TODO: Implement OAuth2 requirements
/**
 * @typedef {Router} RouterBase
 * @typedef {Route} RouteBase
 * 
 * @typedef {object} RouteRequirements
 * @prop {{ name: string; required: boolean; }[]} [parameters=[]] Any required parameters
 * @prop {boolean} [optional=false] If the requirements should be optional
 * @prop {'jwt' | 'none' | 'account'} [authType='none'] The authenication type (default: none)
 * @prop {{ name: string; required: boolean; }[]} [queries=[]] Any additional required query parameters
 * @prop {boolean} [master=false] If the route requires a master key in the headers
 * @prop {boolean} [auth=false] If the route requires an auth key in the headers
 * @prop {{ name: string; required: boolean}[]} [body=[]] If we should require a body in the payload
 * 
 * @typedef {object} RouteOptions
 * @prop {RouteRequirements} [requirements] An object of requirements
 * @prop {string} route The route itself
 * @prop {'get' | 'post' | 'delete' | 'put' | 'patch'} method The method to use
 * @prop {(this: import('./Server'), req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<any>} run The run function
 */