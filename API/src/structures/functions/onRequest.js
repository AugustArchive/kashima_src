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

const JWT = require('../../util/JWT');

/**
 * A function to process requests
 * @param {import('../Server')} server The server instance
 * @param {import('../Routing').RouteBase} route The route instance
 * @param {import('fastify').FastifyRequest} req The request instance
 * @param {import('fastify').FastifyReply} res The response
 */
module.exports = async (server, route, req, res) => {
  server.requests++; // Increment the amount of requests we received

  if (!route.requirements.optional) {
    // Check if we have the "master" requirement
    if (route.requirements.master) {
      if (!req.headers.authorization) return res.status(401).send({
        statusCode: 401,
        message: 'Missing "Authorization" header in the request.'
      });

      if (req.headers.authorization !== server.config.masterKey) return res.status(401).send({
        statusCode: 401,
        message: 'Invalid master key used.'
      });
    }

    // Check if we have the "auth" requirement
    if (route.requirements.auth) {
      // If the request is missing the "Authorization" header
      if (!req.headers.authorization) return res.status(401).send({
        statusCode: 401,
        message: 'Missing "Authorization" header in the request.'
      });

      // Check the authenication type for authenication
      switch (route.requirements.authType) {
        // Authenicate with JWT
        case 'jwt': {
          if (!req.headers.authorization.startsWith('Bearer ')) return res.status(403).send({
            statusCode: 403,
            message: 'JWT token doesn\'t start with "Bearer"'
          });

          const token = req.headers.authorization.split(' ')[1];
          const decoded = JWT.decode(token);

          if (decoded.error) return res.status(403).send({
            statusCode: 403,
            message: decoded.error
          });
        } break;

        // Account token authenication
        case 'account': {
          if (!req.headers.authorization.startsWith('Account ')) return res.status(403).send({
            statusCode: 403,
            message: 'Account token doesn\'t start with "Account"'
          });

          const token = req.headers.authorization.split(' ')[1];
          const account = await server.database.getAccountByToken(token);
          
          if (!account || account === null) return res.status(401).send({
            statusCode: 401,
            message: 'Authenication token was invalid'
          });
        } break;
      }
    }
  }
  
  // Check for any query parameters and see if they are missing
  if (route.requirements.queries && route.requirements.queries.length) {
    const denied = route.requirements.queries.some(x => x.required && !req.query[x.name]);
    
    if (denied) {
      const all = route.requirements.queries.filter(x => x.required && !req.query[x.name]);
      return res.status(400).send({
        statusCode: 400,
        message: `Missing required queries: ${all.map(s => s.name).join(', ')}`
      });
    }
  }

  // Check for any parameters and see if they are missing
  if (route.requirements.parameters && route.requirements.parameters.length) {
    const denied = route.requirements.parameters.some(x => x.required && !req.params[x.name]);

    if (denied) {
      const all = route.requirements.parameters.filter(x => x.required && !req.params[x.name]);
      return res.status(400).send({
        statusCode: 400,
        message: `Missing required parameters: ${all.map(s => s.name).join(', ')}`
      });
    }
  }

  // Check for any specific payload in the body
  if (route.requirements.body && route.requirements.body.length) {
    const denied = route.requirements.body.some(x => x.required && !req.body[x.name]);
    
    if (denied) {
      const all = route.requirements.body.filter(x => x.required && !req.body[x.name]);
      return res.status(400).send({
        statusCode: 400,
        message: `Missing required body payload: ${all.map(x => x.name).join(', ')}`
      });
    }
  }

  try {
    await route.callee.apply(server, [req, res]);
  } catch(ex) {
    server.logger.error(`Unable to process request to "${req.raw.method.toUpperCase()} ${req.raw.url}":`, ex);
    return res.status(500).send({
      statusCode: 500,
      message: 'Unable to fulfill your request',
      error: ex.message
    });
  }
};