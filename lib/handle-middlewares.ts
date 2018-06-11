import { compose } from 'koa-convert';
import Koa = require('koa');
import path = require('path');
import logger from '@server/service/logger';

// 数组里可以嵌套KMiddleware，因为不支持嵌套type所以写成any[]
export type KMiddleware =
  Koa.Middleware
  | string
  | {
      [key: number]: KMiddleware;
    };

interface HandleOpts {
  baseDir: string;
}

/**
 * 处理中间件并将转换成koa2的promise中间件
 * @param list 中间件数组
 * @param opts 配置
 */
export default function(list: any, opts: HandleOpts): Koa.Middleware {
  const middlewares = handle(opts)(list);
  return compose(middlewares);
}

/**
 * 处理字符串、方法、数组类型的中间件
 * @param param0 配置
 */
function handle({ baseDir }: HandleOpts) {
  return function handleMiddlewares(
    middlewares: KMiddleware[],
  ): Koa.Middleware[] {
    return middlewares.reduce((list: KMiddleware[], middleware) => {
      let m = middleware;
      if (typeof m === 'string') {
        try {
          m = require(path.join(baseDir, middleware as string));
        } catch (e) {
          logger.error(e);
          return list;
        }
      }
      if (Array.isArray(m)) {
        list = list.concat(handleMiddlewares(m));
      } else if (typeof m === 'function') {
        list.push(m);
      }

      return list;
    }, []) as Koa.Middleware[];
  };
}