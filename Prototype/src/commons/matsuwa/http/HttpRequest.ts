// Credit: wumpfetch (https://github.com/PassTheWessel/wumpfetch)
// This is for making HTTP requests without any external dependencies
// with plugin creation
import { URL as Url } from 'url';
import { stringify } from 'querystring';
import { version } from '..';
import https from 'https';
import http from 'http';
import zlib from 'zlib';

export type HttpMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'trace' | 'connect' | 'options';
export interface HttpRequestOptions {
  followRedirects?: boolean;
  compress?: boolean;
  timeout?: number;
  headers?: Dict<any>;
  data?: any;
}

interface Dict<T = any> {
  [x: string]: T;
}

interface HttpResponse {
  statusCodeText: string;
  statusCode: number;
  successful: boolean;
  json<T = Dict>(): T;
  text(): string;
  stream(): http.IncomingMessage; // This is a Stream instance
}

const CompressionTypes = ['gzip', 'deflate'];
export default class HttpRequest {
  public sendDataAs?: 'json' | 'text' | 'buffer' | 'form' | string;
  public options: HttpRequestOptions;
  public method: HttpMethod;
  public url: Url;

  constructor(url: string, method: HttpMethod, options: HttpRequestOptions = {}) {
    if (typeof url !== 'string') throw new SyntaxError(`HttpRequest#url requires the URL to be a string, gotten ${typeof url}`);

    this.sendDataAs = options.data ? typeof options.data === 'string' ? 'text' : options.data instanceof Object ? 'json' : undefined : undefined;
    this.options = options;
    this.method = method;
    this.url = new Url(url);
  }

  body(data: any, sendDataAs?: 'json' | 'text' | 'form' | 'buffer') {
    this.options.data = sendDataAs === 'form' ? stringify(data) : typeof data === 'string' ? data : data instanceof Object && !Buffer.isBuffer(data) ? data : data instanceof Buffer ? data.toString() : undefined;
    this.sendDataAs = sendDataAs ? sendDataAs.toLowerCase() : typeof data === 'string' ? 'text' : !Buffer.isBuffer(data) ? 'json' : undefined;
  
    return this;
  }

  header(name: string, value: string): this;
  header(name: Dict): this;
  header(name: string | Dict, value?: string) {
    // Add the header object if not in the options object
    if (!this.options.headers) this.options.headers = {};

    if (name instanceof Object) {
      for (const key of Object.keys(name)) {
        this.options.headers![key] = name[key];
      }
    } else {
      this.options.headers![name] = value!;
    }

    return this;
  }

  compress() {
    this.options.compress = true;
    if (!this.options.headers!['accept-encoding']) {
      this.options.headers!['accept-encoding'] = CompressionTypes.join(', ');
    }

    return this;
  }

  timeout(ms: number = 30000) {
    this.options.timeout = ms;
    return this;
  }

  query(name: Dict): this;
  query(name: string, value: string): this;
  query(name: string | Dict, value? :string) {
    if (name instanceof Object) {
      for (const queryName of Object.keys(name)) {
        this.url.searchParams.append(queryName, name[queryName]);
      }
    } else {
      this.url.searchParams.append((name as string), value!);
    }

    return this;
  }

  execute() {
    return new Promise<HttpResponse>((resolve, reject) => {
      console.log(this.options);
      if (this.options.data) {
        if (!this.options.headers!['User-Agent']) this.header('User-Agent', `Matsuwa (v${version}, https://github.com/kashima-org/desktop-app)`);
        if (this.sendDataAs === 'json' && !this.options.headers!['content-type']) this.header('content-type', 'application/json');
        if (this.sendDataAs === 'form') {
          if (!this.options.headers!['content-type']) this.header('content-type', 'x-www-form-urlencoded');
          if (!this.options.headers!['content-length']) this.options.headers!['content-length'] = Buffer.byteLength(this.options.data);
        }
      }

      const request = this.url.protocol === 'https:' ? https.request : http.request;
      const options = {
        protocol: this.url.protocol,
        headers: this.options.headers!,
        method: this.method.toUpperCase(),
        path: `${this.url.pathname}${this.url.search}`,
        port: this.url.port,
        host: this.url.host
      };

      const onRequest = (core: http.IncomingMessage) => {
        let body = Buffer.alloc(0);
        let stream: any = core;

        if (this.options.compress) {
          switch (this.options.headers!['content-encoding']) {
            case 'gzip': stream = core.pipe(zlib.createGunzip()); break;
            case 'deflate': stream = core.pipe(zlib.createInflate()); break;
          }
        }

        core
          .on('data', chunk => body = Buffer.concat([body, chunk]))
          .on('error', error => reject(error))
          .on('end', () => {
            const res: HttpResponse = {
              statusCodeText: http.STATUS_CODES[core.statusCode || 200]!,
              statusCode: core.statusCode || 200,
              successful: core.statusCode! >= 200 || core.statusCode! > 300,
              stream: () => core,
              json: () => JSON.parse(body.toString()),
              text: () => body.toString()
            };

            resolve(res);
          });
      };

      const req = request(options, onRequest);
      if (this.options.timeout) {
        req.setTimeout(this.options.timeout, () => {
          req.abort();
          reject(new Error('Request was abored due to timeout'));
        });
      }

      if (this.options.data) {
        if (this.sendDataAs === 'json') req.write(JSON.stringify(this.options.data));
        else if (this.options.data instanceof Object) req.write(JSON.stringify(this.options.data));
        else req.write(this.options.data);
      }

      req.end();
    });
  }
}