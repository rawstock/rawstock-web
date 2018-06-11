// tslint:disable:ban-types no-console
/**
 * 路由中间件
 */
'use strict';
import { symbolRoutePrefix, Route } from './Route';
import * as Koa from 'koa';

// 记录请求数
let requestID = 0;

/**
 * url参数
 * list/:id?username=zhangsan&&age=30
 * @required({query: 'username'})
 * @required({query: ['username','age'],params: 'id'})
 */
export function required(args: any) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    return requireDescriptor(target, name, descriptor, args);
  };
}

/**
 * 添加静态属性
 * @prefix('/user')
 */
export function prefix(name: string) {
  return (target: any) => {
    target.prototype[symbolRoutePrefix] = name;
  };
}

/**
 * 路由
 * @router({
 *   method: 'get',
 *   path: '/login/:id'
 * })
 */
export function router(config: {
  path: string;
  method?: string;
  unless?: boolean;
}) {
  return (target: any, name: string) => {
    // map类型设置值
    Route.DECORATED_ROUTERS.set(
      {
        target,
        path: config.path,
        method: config.method || 'get',
        unless: config.unless,
      },
      target[name]
    );
  };
}

/**
 * 修饰方法
 * @params
 * @convert(async function(ctx, next){await next()})
 */
export function convert(middleware: Function) {
  return decorate(
    (
      target: any,
      name: string,
      descriptor: PropertyDescriptor,
      pMiddleware: Function
    ) => {
      target[name] = sureIsArray(target[name]);
      target[name].splice(target[name].length - 1, 0, pMiddleware);
      return descriptor;
    },
    sureIsArray(middleware)
  );
}

/**
 * 日志 修饰api方法
 * use: @log
 * @export
 * @param {*} target
 * @param {string} name
 * @param {PropertyDescriptor} value
 * @returns
 */
export function log(target: any, name: string, value: PropertyDescriptor) {
  target[name] = sureIsArray(target[name]);
  target[name].splice(target[name].length - 1, 0, Logger);

  async function Logger(ctx: Koa.Context, next: any) {
    // 请求数加1
    const currentRequestID = requestID++;

    // 请求开始时间
    const startTime = process.hrtime();
    console.log(`→ (ID:${currentRequestID}) ${ctx.method} ${ctx.url}`);
    if (ctx.method.toLowerCase() === 'post') {
      console.log(
        `→ (ID:${currentRequestID}) ${ctx.method} ${JSON.stringify(
          ctx.request
        )}`
      );
    }
    await next();

    // 返回response结束时间
    const endTime = process.hrtime();
    // 计算进程总时间
    const elapsed =
      (endTime[0] - startTime[0]) * 1000 +
      (endTime[1] - startTime[1]) / 1000000;
    console.log(
      `← (ID:${currentRequestID}) ${ctx.method} ${ctx.url} : Status(${
        ctx.status
      }) Time(${elapsed.toFixed(0)}ms)`
    );
  }
  return value;
}

/**
 * 转换数组
 */
function sureIsArray(arr: any) {
  return Array.isArray(arr) ? arr : [arr];
}

/**
 * 是否被修饰的对象原来值
 */
function isDescriptor(desc: PropertyDescriptor) {
  if (!desc || !desc.hasOwnProperty) {
    return false;
  }
  for (const key of ['value', 'initializer', 'get', 'set']) {
    if (desc.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
}

/**
 * 获取第一个元素方法
 */
function last(arr: Function[]): PropertyDescriptor {
  return arr[arr.length - 1] as PropertyDescriptor;
}

/**
 * URL必传参数校验
 * @required({params: 'username'})
 * @required({params: ['username','age']})
 * @required({query: 'username'})
 */
function requireDescriptor(
  target: any,
  name: string,
  descriptor: PropertyDescriptor,
  rules: any
) {
  target[name] = sureIsArray(target[name]);
  target[name].splice(target[name].length - 1, 0, middleware);
  return descriptor;

  async function middleware(ctx: any, next: any) {
    if (rules.query) {
      rules.query = sureIsArray(rules.query);
      for (const param of rules.query) {
        if (!ctx.query[param]) {
          ctx.throw(412, `GET Request query: ${param} required`);
        }
      }
    }
    if (rules.params) {
      rules.params = sureIsArray(rules.params);
      for (const param of rules.params) {
        if (!ctx.params[param]) {
          ctx.throw(412, `GET Request params: ${param} required`);
        }
      }
    }
    await next();
  }
}

/**
 * 执行函数
 */
function decorate(handleDescriptor: Function, entryArgs: Function[]) {
  if (isDescriptor(last(entryArgs))) {
    return handleDescriptor(entryArgs);
  } else {
    return (...all) => {
      return handleDescriptor(...all, ...entryArgs);
    };
  }
}
