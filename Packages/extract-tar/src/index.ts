import { HttpMethod, HttpClient, middleware } from '@augu/orchid';
import zlib from 'zlib';
import path from 'path';
import tar from 'tar';

import {
  createWriteStream,
  promises as fs,
  existsSync,
  createReadStream
} from 'fs';

const http = new HttpClient()
  .use(middleware.streams());

export async function extract(options: {
  url: string;
  dest: string;
  path: string;
  compressed?: boolean
}) {
  return new Promise<void>(async (resolve, reject) => {
    if (!existsSync(options.dest)) await fs.mkdir(options.dest);

    if (!options.hasOwnProperty('compressed')) {
      const paths = options.url.split('/');
      const file = paths[paths.length - 1];
      const ext = path.extname(file);

      if (ext === '.tgz' || ext === '.tar.gz') options.compressed = true;
      else options.compressed = false;
      return extract(options);
    }

    const res = await http.request({
      url: options.url,
      method: HttpMethod.Get
    }).execute();

    const stream = res.stream();
    if (options.compressed) stream.pipe(zlib.createGunzip());

    const writer = createWriteStream(options.path);
    stream.pipe(writer);

    const t = createReadStream(options.path).pipe(tar.x({
      cwd: options.dest
    }));

    await fs.unlink(options.path);

    t.on('finish', resolve);
    t.on('error', reject);
  });
}

export const version = require('../package.json').version;