# @kashima/stream
> :mount_fuji: **| Extension for native audio streams in Node.js for the [ws](https://npmjs.com/package/ws) library.**
>
> :light_bulb: **| Inspiration: [socket.io-stream](https://github.com/nkzawa/socket.io-stream)**
>
> [Documentation](https://docs.kashima.app/libraries/stream) **|** [NPM](https://npmjs.com/package/@kashima-org/stream)

## Example
**Client-side**:

```js
require('@kashima-org/stream'); // Initialize the library, it will expose WebSocket#getStream
const WebSocket = require('ws');
const { dirname } = require('path');
const fs = require('fs');

const service = new WebSocket('ws://localhost:6969');
const stream = service.getStream();

stream.onReceive((event, packet) => {
  if (event === 'packet') {
    console.log(`Received event ${event}.`);

    const name = dirname(packet.name);
    const readable = packet.getReadable();
    readable.pipe(fs.createWriteStream(name));
  } else {
    console.log(`Unknown event: ${event}`);
  }
});

stream.dispose(); // Dispose the instance
```

**Server-side**:

```js
require('@kashima-org/stream'); // Initialize the library, it will expose Server#stream
const { Server } = require('ws');

const server = new Server({ port: 6969 });
const stream = server.stream(); // Initialize the stream

stream.send('packet', { name: 'file.jpg' });
fs.createReadStream('file.jpg').pipe(stream);
```

## License
**@kashima-org/stream** is released under a custom license. Read [here](/LICENSE) for more information.