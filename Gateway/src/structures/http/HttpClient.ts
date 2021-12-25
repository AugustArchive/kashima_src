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

import HttpRequest, { HttpRequestOptions } from './HttpRequest';

export class HttpClient {
  /**
   * Make a `GET` request to the URL provided
   * @param url The url to make a request to
   * @param options Any additional options to send
   */
  get(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'get', options);
  }

  /**
   * Make a `PUT` request to the URL provided
   * @param url The url to make a request to
   * @param options Any additional options to send
   */
  put(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'put', options);
  }

  /**
   * Make a `POST` request to the URL provided
   * @param url The url to make a request to
   * @param options Any additional options to send
   */
  post(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'post', options);
  }

  /**
   * Make a `DELETE` request to the URL provided
   * @param url The url to make a request to
   * @param options Any additional options to send
   */
  delete(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'delete', options);
  }
}