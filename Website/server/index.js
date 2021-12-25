const fastify = require('fastify');
const config  = require('./config.json');
const axios   = require('axios');
const log     = require('./logger');

const server = fastify();

server.register(require('fastify-cors'));
server.get('/', (_, res) => {
  log('request', 'User has made request to "GET /"');
  return res.status(200).send({ hello: 'world' });
});
server.post('/request', async (req, res) => {
  log('request', 'Frontend ');
  const needs = !req.headers.hasOwnProperty('x-requires-auth') 
    ? false 
    : req.headers.hasOwnProperty('x-requires-auth');

  if (!req.body) return res.status(500).send({
    statusCode: 500,
    message: 'Missing body payload!'
  });

  if (!req.body.hasOwnProperty('route')) return res.status(500).send({
    statusCode: 500,
    message: 'Missing "route" body payload!'
  });

  if (!req.body.hasOwnProperty('method')) return res.status(500).send({
    statusCode: 500,
    message: 'Missing "method" body payload!'
  });

  if (req.body.hasOwnProperty('method') && !['get', 'post', 'put', 'delete'].includes(req.body.method)) return res.status(500).send({
    statusCode: 500,
    message: `Invalid method: ${req.body.method}`
  });

  const payload = !req.body.hasOwnProperty('data') ? null : req.body.data;
  const method = req.body.method;

  const data = {
    headers: {}
  };

  if (payload) data.data = payload;
  if (needs) data.headers['Authorization'] = config.key;
  if (!['delete', 'get'].includes(method)) data.headers['Content-Type'] = 'application/json';

  const resp = await axios({
    url: `https://api.kashima.app${req.body.route}`,
    method: req.body.method,
    ...data
  });
  if (resp.data.message) res.status(resp.data.statusCode).send(resp.data);
  else res.status(200).send(resp.data);
});

async function main() {
  log('info', 'Bootstrapping...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  server.listen(6940, (error, address) => {
    if (error) return log('error', 'An error occured while bootstrapping, is port {colors:green:6940} taken?', error);
    else log('info', `Now listening at ${address}!`);
  });
}

main();