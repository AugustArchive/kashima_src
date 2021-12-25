const credentials = require('./credentials.json');
const WebSocket = require('ws');
const { uuid } = require('../build/util');

const server = new WebSocket('ws://localhost:7794');
const payloads = {};
let interval;

function send(op, d) {
  return new Promise((resolve, reject) => {
    const nonce = uuid();
    const data = JSON.stringify({ op, nonce, d });

    server.send(data);
    payloads[nonce] = { resolve, reject };
  });
}

server
  .on('open', async () => {
    console.log('Connection was opened!');
    const identify = await send('identify', credentials);
    console.log(`Welcome ${identify.user.username}!`);
    await send('status', {
      status: 'online'
    });

    interval = setInterval(() => {
      send('heartbeat')
        .then(() => console.log('Sent out heartbeat!'))
        .catch(console.error);
    }, 30000);
  })
  .on('close', (code, reason) => {
    console.log(`Connection was close with code ${code}: ${reason === '' ? 'None' : reason}`);
    process.emit('SIGINT');
  }).on('message', (event) => {
    const payload = JSON.parse(event);
    if (payloads.hasOwnProperty(payload.d.nonce)) {
      const { resolve, reject } = payloads[payload.d.nonce];
      if (payload.d.error) reject(new Error(payload.d.message));
      resolve(payload.d);
    } else {
      console.log(`Invalid nonce: ${payload.d.nonce} (not by us)`);
    }
  });

// Clear the interval, close the connection, and exit
process.on('SIGINT', () => {
  clearInterval(interval);
  server.close();

  console.log('Exited.');
  process.exit(0);
});