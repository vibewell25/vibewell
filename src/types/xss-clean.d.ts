declare module 'xss-clean' {
  import { RequestHandler } from 'express';

  interface XssOptions {
    enabled?: boolean;
    whitelist?: string[];
  }

  function xss(options?: XssOptions): RequestHandler;

  export = xss;
}
