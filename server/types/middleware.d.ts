export declare namespace View {
  export interface ViewOpts {
    viewPath: string;
    isDebug: boolean;
    locals?: Locals;
  }

  interface Locals {
    // tslint:disable-next-line
    [prop: string]: any;
  }

  interface Render {
    (name: string, locals?: Locals): string;
  }

  interface RenderView {
    (name: string, view: string, locals?: Locals): string;
  }
}
