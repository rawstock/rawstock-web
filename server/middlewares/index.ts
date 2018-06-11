import bodyParser = require('koa-bodyparser');

import handleMiddlewares from '@lib/handle-middlewares';
import config = require('config');

import view from './view';

const list = [
  'init',
  'error',
  view({
    viewPath: config.path.views,
    isDebug: config.isDebug,
    locals: {
      config,
    },
  }),
  bodyParser(),
  'controllers',
];

export = handleMiddlewares(list, { baseDir: __dirname });
