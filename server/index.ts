require('module-alias/register');

import Koa = require('koa');
import config = require('config');
import path = require('path');
import forceScripts = require('force-scripts');

require('../lib/handle-process');
import logger from './service/logger';

const app = new Koa();
const ROOT = process.cwd();

let middlewares;

app.context.config = config;
app.context.logger = logger;

if (config.isDebug) {
  // 热替换模块 -- Begin
  const HotReloader = require('../lib/hot-reloader');
  const hotReloader = new HotReloader({
    paths: [path.join(ROOT, 'dist', 'server'), path.join(ROOT, 'config')],
    ignores: [/node_modules/, /(^|[\/\\])\../, p => {
      return p.indexOf('server/index') > -1
    }],
    callback(file: string) {
      logger.debug('File Change %s', file);
    },
  });
  hotReloader.start();
  // 热替换模块 -- End

  // 线下中间件 -- Begin
  middlewares = async (ctx, next) => {
    const myMiddlewares: Koa.Middleware = require('./middlewares');

    await myMiddlewares.call(null, ctx, next);
  };
  // 线下中间件 -- End
} else {
  middlewares = require('./middlewares') as Koa.Middleware;
}

app.use(forceScripts());
app.use(middlewares);



app.listen(config.app.port, () => {
  logger.info(`Server is running on http://127.0.0.1:${config.app.port}`);
});
