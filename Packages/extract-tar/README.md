# @kashima-org/tar
> :outbox_tray: **| Lightweight way to extract a `.tar.gz` file from the internet.**
>
> [Documentation](https://docs.kashima.app/packages/tar) **|** [NPM](https://npmjs.com/package/@kashima-org/tar) **|** [GitHub](https://github.com/kashima-org/tar)

## Usage
```ts
import { extract } from '@kashima-org/tar';

extract({
  file: 'filename',
  dest: 'directory',
  url: 'url to fetch from'
}).catch(console.error);
```

## Why?
Well, we built this library so we can easily extract tar.gz files without adding more and more dependencies.

## License
**@kashima-org/extract-tar** is released under a custom license, read [here](/LICENSE) for more information.