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

import { URL } from 'url';
import http from 'http';

import HttpResponse from './HttpResponse';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type SendDataAs = 'json' | 'text';
export interface HttpRequestOptions {
  headers?: { [x: string]: any }
  data?: string | { [x: string]: any };
}

export default class HttpRequest {
  /**
   * The type to send data as
   */
  public sendDataAs: SendDataAs = 'json';

  /**
   * A dictionary of headers
   */
  public headers: { [x: string]: any };

  /**
   * The HTTP method to use
   */
  public method: HttpMethod;

  /**
   * The data as a string, dictionary, or null
   */
  public data: string | { [x: string]: any } | null;

  /**
   * The URL
   */
  public url: URL;

  constructor(url: string, method: HttpMethod, options: HttpRequestOptions) {
    this.headers = options.headers || {};
    this.method = method;
    this.data = options.data || null;
    this.url = new URL(url);
  }

  /**
   * Adds a header to the headers dictionary
   * @param name The name of the header or an object of headers
   * @param value The value of the header (if it's not an object)
   */
  header(name: { [x: string]: any }): this;
  header(name: string, value: string): this;
  header(name: string | { [x: string]: any }, value?: string) {
    if (name instanceof Object) {
      for (const key of Object.keys(name)) {
        const header = key.toLowerCase();
        this.headers[header] = name[key];
      }
    } else {
      this.headers[(name as string).toLowerCase()] = value!;
    }

    return this;
  }

  /**
   * Adds a query parameter to the URL
   * @param name The name of the query of an object of queries to add
   * @param value The value of the query (if it's not an object)
   */
  query(name: { [x: string]: string }): this;
  query(name: string, value: string): this;
  query(name: string | { [x: string]: string }, value?: string) {
    if (name instanceof Object) {
      for (const key of Object.keys(name)) {
        this.url.searchParams.append(key, name[key]);
      }
    } else {
      this.url.searchParams.append(name as string, value!);
    }

    return this;
  }

  /**
   * Sends a payload to the server
   * @param data The body to send
   * @param sda The content to send as
   */
  body<T>(data: T): this;
  body<T>(data: T, sda: SendDataAs): this;
  body<T>(data: T, sda?: SendDataAs) {
    this.data = data;
    this.sendDataAs = sda !== undefined ? sda : (data instanceof Object) ? 'json' : 'text';
    return this;
  }

  /**
   * Executes the request
   */
  execute() {
    return new Promise<HttpResponse>((resolve, reject) => {
      let request!: http.ClientRequest;
      const options = {
        protocol: this.url.protocol,
        headers: this.headers,
        method: this.method.toUpperCase(),
        path: `${this.url.pathname}${this.url.search}`,
        port: this.url.port,
        host: this.url.host
      };

      /**
       * Function to indicate a request
       * @param msg The response object
       */
      const onRequest = (msg: http.IncomingMessage) => {
        const res = new HttpResponse(msg);
        msg
          .on('error', error => reject(error))
          .on('data', chunk => res.addChunk(chunk))
          .on('end', () => resolve(res));
      };

      const proto = this.url.protocol.replace(':', '');
      switch (this.url.protocol) {
        case 'http:': request = http.request(options, onRequest); break;
        case 'https:': request = http.request(options, onRequest); break;
        default: throw new TypeError(`Invalid protocol: "${proto}"`);
      }

      request.on('error', error => reject(error));
      if (this.data !== null) {
        if (this.sendDataAs === 'json' || this.data instanceof Object) request.write(JSON.stringify(this.data));
        else request.write(this.data);
      }

      request.end();
    });
  }
}