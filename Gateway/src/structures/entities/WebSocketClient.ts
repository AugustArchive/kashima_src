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

import { OPCodes, CloseCodes } from '../../util/Enums';
import { randomBytes } from 'crypto';
import { HttpClient } from '../http';
import WebSocket from 'ws';
import { User } from '../../util/Types';

/** Class to represent a WebSocket connection */
export class WebSocketClient {
  public heartbeatTimeout: NodeJS.Timeout;
  public connection: WebSocket;
  public user?: KashimaUser;
  public id: string;

  constructor(tls: WebSocket) {
    this.connection = tls;
    this.user = undefined;
    this.id = randomBytes(8).toString('hex');

    this.heartbeatTimeout = setTimeout(() => {
      if (this.connection.readyState !== WebSocket.OPEN) return;
      this.connection.close(CloseCodes.NoAckedHeartbeat, 'Client didn\'t send a heartbeat, possibly connection lost.');
    }, 60000);
  }

  send(op: OPCodes, data: any) {
    this.connection.send(JSON.stringify({
      op,
      t: Date.now(),
      d: data
    }));
  }

  setUser(payload: User) {
    delete payload['$__'];
    delete payload['isNew'];
    delete payload['$locals'];
    delete payload['$op'];
    delete payload['$init'];

    // @ts-ignore
    this.user = new KashimaUser(payload._doc);
  }
}

/** Represents a user */
class KashimaUser {
  public permissions: { allowed: number; denied: number };
  public avatarUrl: string;
  public username: string;
  public status: { current: 'offline' | 'online' | 'listening'; song: string | null; };
  public token: string;
  public jwt: string | null;

  constructor(payload: User) {
    this.permissions = payload.permissions;
    this.avatarUrl = payload.avatarUrl;
    this.username = payload.username;
    this.status = payload.status;
    this.token = payload.token;
    this.jwt = payload.jwt;
  }

  /**
   * Function to edit `KashimaUser#jwt` if it's null
   */
  async refreshToken() {
    const client = new HttpClient();
    if (this.jwt === null) {
      const request = await client
        .post('http://api.kashima.app/accounts/jwt', {
          headers: {
            Authorization: `Account ${this.token}`
          }
        }).execute();

      const res = request.json();
      this.jwt = res.token;

      return true;
    } else {
      const request = await client
        .post('http://api.kashima.app/accounts/jwt/validate', {
          headers: {
            Authorization: `Bearer ${this.jwt}`
          }
        }).execute();

      const res = request.json();
      if (!request.ok) return false;

      this.jwt = res.token;
      return true;
    }
  }

  /**
   * Function to convert this class to a JSONified version of itself
   */
  toJson() {
    return {
      permissions: this.permissions,
      avatarUrl: this.avatarUrl,
      username: this.username,
      status: this.status,
      token: this.token,
      jwt: this.token
    };
  }
}