const path = require('path');

const ROOT = process.cwd();

module.exports = {
  app: {
    port: 8080,
    "publicPath": "/__static/"
  },
  path: {
    views: path.join(ROOT, 'server', 'views'),
    controllers: path.join(ROOT, 'dist', 'server', 'controllers'),
  },
};