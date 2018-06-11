import { BaseContext, Context } from 'koa';
import { Winston } from 'winston';
import { View } from './middleware';

interface Config {
  // tslint:disable-next-line
  [prop: string]: any;
}

declare module 'koa' {
  interface BaseContext {
    config: Config;
    logger: Winston;
    uuid: string;
  }

  interface Context {
    render: View.Render;
    renderView: View.RenderView;
  }
}
