import * as Koa from 'koa';
import { router, prefix } from '../middlewares/router';

@prefix('/')
export default class PageController {
  @router({
    path: '*',
  })
  async index(ctx: Koa.Context): Promise<void> {
    ctx.body = ctx.renderView('h5', 'views/H5/index', {
      appState: {
        title: '2221',
      },
    });
  }
}