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

import WebSocket, { Server as WebSocketServer } from 'ws';
import { WebSocketClient } from './entities';
import { Collection } from '@augu/immutable';
import { HttpClient } from './http';
import MethodListener from './MethodListener';
import { CloseCodes } from '../util/Enums';
import onRequest from './hooks/onRequest';
import Logger from './Logger';

export interface Config {
  heartbeatInterval: number;
  masterKey: string;
  port: number;
}

export class Server {
  public connections: number;
  public listener: MethodListener;
  public clients: Collection<WebSocketClient>;
  public logger: Logger;
  public http: HttpClient;
  public app: WebSocketServer;

  constructor(public config: Config) {
    this.connections = 0;
    this.listener = new MethodListener(this);
    this.clients = new Collection();
    this.logger = new Logger();
    this.http = new HttpClient();
    this.app = new WebSocketServer({ port: config.port });
  }

  start() {
    this.logger.info('Now booting up...');

    this.app.on('connection', this.onConnection.bind(this));
    this.logger.info(`Server has booted. (ws://127.0.0.1:${this.config.port})`);
  }

  private onConnection(socket: WebSocket) {
    this.connections++;
    const client = new WebSocketClient(socket);
    this.clients.set(client.id, client);

    this.logger.connection(`Received a new connection! Now at ${this.connections.toLocaleString()} connections avaliable.`);
    
    setTimeout(() => {
      if (client.user) return;
      socket.close(CloseCodes.NoAckedIdentify, 'No identify packet was sent.');
    }, 15000);

    client.heartbeatTimeout.unref();
    socket.on('close', async (code, reason) => {
      this.connections--;
      this.logger.warn(`Client ${client.id} has disconnected. Now at ${this.connections.toLocaleString()} connections avaliable (${code}: ${reason || 'None'})`);

      if (client.user) {
        await this
          .http
          .post('http://api.kashima.app/accounts', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${client.user.jwt}`
            },
            data: {
              set: {
                status: {
                  current: 'offline',
                  song: null
                }
              }
            }
          })
          .execute();
      }

      this.clients.delete(client.id);
    });

    socket.on('message', (event: any) => onRequest.apply(this, [event, client]));
  }
}