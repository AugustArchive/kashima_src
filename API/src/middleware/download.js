// Middleware for "Reply#download"
// Credit: https://stackoverflow.com/a/22907134
const { createReadStream, statSync } = require('fs');
const plugin = require('fastify-plugin');
const mimes = require('./mimes.json');
const path = require('path');

/**
 * Downloads a file from a URL
 * @param {import('fastify').FastifyReply} reply The reply instance
 * @param {string} file The file
 * @param {string} name The filename to send as
 * @returns {Promise<boolean>} If the process was a success or not
 */
const download = (reply, file, name) => new Promise((resolve, reject) => {
  const stream = createReadStream(file);
  const ext = path.extname(file);
  const type = mimes.hasOwnProperty(ext) ? mimes[ext] : null;
  const stats = statSync(file);

  const filename = name.replace(/{ext}/gi, ext);

  if (type) {
    reply
      .header('Content-type', type)
      .header('Content-Disposition', `attachment; filename=${filename}`)
      .header('Content-Length', stats.size)
      .send(stream);

    return resolve();
  } else {
    return reject(new Error('Content-Type was undefined'));
  }
});

/**
 * Factory function to build this middleware
 * @param {import('fastify').FastifyInstance} server The server itself
 * @param {(error?: import('fastify').FastifyError) => void} next The next function
 */
const factory = (server, _, next) => {
  server.decorateReply('download', function (file, name = 'file.{ext}') {
    // eslint-disable-next-line
    return download(this, file, name);
  });

  next();
};

module.exports = plugin(factory, {
  fastify: '>=2.12',
  name: 'fastify-download'
});