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

import { WebSocketClient } from './entities';
import { OPCodes } from '../util/Enums';
import { Method } from './decorators';
import { Server } from './Server';

export default class MethodListener {
  constructor(public server: Server) {}

  @Method(OPCodes.Identify)
  async onIdentify(client: WebSocketClient, payload: any, nonce: string) {
    const request = await this
      .server
      .http
      .post('http://api.kashima.app/accounts/login', {
        data: {
          username: payload.d.username,
          password: payload.d.password
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.server.config.masterKey
        }
      }).execute();

    const result = request.json();
    if (!request.ok) return client.send(OPCodes.Error, {
      message: 'Unable to validate account',
      error: result.message
    });

    client.setUser(result.data);
    await client.user!.refreshToken();

    return client.send(OPCodes.Identify, {
      nonce,
      user: client.user!.toJson()
    });
  }

  @Method(OPCodes.Heartbeat)
  async onHeartbeat(client: WebSocketClient, _: any, nonce: string) {
    client.heartbeatTimeout.refresh();
    return client.send(OPCodes.Heartbeat, {
      nonce
    });
  }

  @Method(OPCodes.Status)
  async onStatus(client: WebSocketClient, payload: any, nonce: string) {
    if (!payload.d.status) return client.send(OPCodes.Error, {
      message: 'No "status" was in the payload content.',
      nonce
    });

    const valid = ['online', 'offline', 'listening'];
    if (!valid.includes(payload.d.status)) return client.send(OPCodes.Error, {
      message: `Invalid status: ${payload.d.status} (${valid.join(', ')})`,
      nonce
    });

    if (payload.d.status === 'listening' && !payload.d.song) return client.send(OPCodes.Error, {
      message: 'Missing "song" in the payload data',
      nonce
    });

    const request = await this.server.http.post('http://api.kashima.app/accounts', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${client.user!.jwt}`
      },
      data: {
        set: {
          status: {
            current: payload.d.status,
            song: payload.d.song !== null ? payload.d.song : null
          }
        }
      }
    }).execute();

    const res = request.json();
    if (!request.ok) return client.send(OPCodes.Error, {
      message: 'Unable to update status',
      error: res.message,
      nonce
    });

    return client.send(OPCodes.Status, {
      data: payload,
      nonce
    });
  }
}