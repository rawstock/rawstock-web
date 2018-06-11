'use strict';
// tslint:disable:ban-types
import * as Router from 'koa-router';
import * as glob from 'glob';
import * as path from 'path';

const router = new Router();

// 定义不变字段，在使用时读取
export const symbolRoutePrefix: symbol = Symbol('routePrefix');

/**
 * 路由执行类
 * 入口文件载入
 * const route = new Route(ctx: Koa);
 *
 * @class Route
 */
export class Route {
  // 静态 存储被修饰后的路由的地方
  static DECORATED_ROUTERS = new Map();
  public router: any;

  /**
   * Creates an instance of Route.
   * @memberOf Route
   */
  constructor() {
    this.router = router;
  }

  /**
   * 注册路由
   * new Route().registerRouters(apipath);
   *
   * @param {String} controllerDir api文件路径
   *
   * @memberOf Route
   */
  getDecoratedRouters(controllerDir: string) {
    // 载入api接口,使用sync同步载入
    glob.sync(path.join(controllerDir, './*.js')).forEach(item => {
      require(item);
    });
    // 不做校验的路由集合
    const unlessPath = [];
    // 配置路由
    for (const [config, controller] of Route.DECORATED_ROUTERS) {
      const controllers = Array.isArray(controller) ? controller : [controller];
      let prefixPath = config.target[symbolRoutePrefix];
      if (prefixPath && !prefixPath.startsWith('/')) {
        prefixPath = '/' + prefixPath;
      }
      // //拼接api路由
      const routerPath = prefixPath + config.path;
      // 将忽略路由集合
      if (config.unless) {
        unlessPath.push(routerPath);
      }
      controllers.forEach(c =>
        this.router[config.method](routerPath, c)
      );
    }
  }
}
