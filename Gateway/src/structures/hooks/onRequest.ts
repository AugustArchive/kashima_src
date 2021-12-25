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

/* eslint-disable no-invalid-this */
import { WebSocketClient } from '../entities';
import { getAllMethods } from '../decorators';
import { OPCodes } from '../../util/Enums';
import { Server } from '../Server';
import { uuid } from '../../util';

export default (async function (this: Server, event: any, client: WebSocketClient) {
  let payload!: any;
  try {
    payload = JSON.parse(event);
  } catch(ex) {
    client.send(OPCodes.Error, {
      message: 'Unable to parse payload.',
      nonce: uuid()
    });
  }

  const nonce = payload.nonce || uuid();
  const methods = getAllMethods(this.listener);

  if (!payload.op) return client.send(OPCodes.Error, {
    message: 'Payload didn\'t get any OPCode.',
    nonce
  });

  const method = methods.find(x => x.op === payload.op);
  if (method) {
    await method.execute.apply(this.listener, [client, payload, nonce]);
    this.logger.info(`Ran method ${method.op} for client ${client.id} (user=${client.user === undefined ? 'undefined' : client.user.username})`);
  }
});