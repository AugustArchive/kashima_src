/**
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

const { getArbitrayPath } = require('./util');
const { Server, Logger } = require('./structures');
const { existsSync } = require('fs');

const logger = new Logger('Master');
if (!existsSync(getArbitrayPath('config.json'))) {
  const loc = getArbitrayPath('config.json');
  logger.warn(`Missing "config.json" in directory ${loc}`);
  process.exit(1);
}

const config = require('./config.json');
const server = new Server(config);

logger.info(`Launching API server in ${logger.colors.yellow(config.environment)} mode!`);
server.run();

process.on('unhandledRejection', (error) => logger.warn('Recieved "unhandledRejection" protocol:', error));
process.on('uncaughtException', (error) => logger.warn('Received "uncaughtException" protocol:', error));