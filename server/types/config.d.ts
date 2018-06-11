declare module 'config' {
  export const app: App;
  export const path: Path;
  export const isDebug: boolean | undefined;

  interface Path {
    views: string;
    controllers: string;
  }

  interface App {
    port: string;
    publicPath: string;
  }
}
