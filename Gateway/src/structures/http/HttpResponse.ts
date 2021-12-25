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

import { IncomingMessage, IncomingHttpHeaders } from 'http';

export default class HttpResponse {
  /**
   * The status code of the response
   */
  public statusCode: number;

  /**
   * The headers that we gotten from the response
   */
  public headers: IncomingHttpHeaders;

  /**
   * The core response instance
   */
  public core: IncomingMessage;

  /**
   * The body as a Buffer
   */
  public body: Buffer;

  /**
   * Creates a new instance of the http response class
   * @param res The response object
   */
  constructor(res: IncomingMessage) {
    this.statusCode = res.statusCode || 200;
    this.headers = res.headers;
    this.core = res;
    this.body = Buffer.alloc(0);
  }

  /**
   * Returns a boolean if the status code is 200 or is over/equal to 400
   */
  get ok() {
    return this.statusCode >= 200 || this.statusCode > 300;
  }

  /**
   * Parses the body as a JSON object literal
   */
  json<T = any>(): T {
    return JSON.parse(this.body.toString());
  }

  /**
   * Function to allocate more bytes into the body buffer
   * @param chunk The chunk of bytes to add
   */
  addChunk(chunk: any) {
    this.body = Buffer.concat([this.body, chunk]);
  }
}