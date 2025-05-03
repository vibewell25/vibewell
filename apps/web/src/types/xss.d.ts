declare module 'xss' {
  interface IXssOptions {
    whiteList?: { [tag: string]: string[] };
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: boolean | string[];
    allowCommentTag?: boolean;
    onTag?: (tag: string, html: string, options: any) => string | void;
    onTagAttr?: (tag: string, name: string, value: string, isWhiteAttr: boolean) => string | void;
    onIgnoreTag?: (tag: string, html: string, options: any) => string | void;
    onIgnoreTagAttr?: (tag: string, name: string, value: string, isWhiteAttr: boolean) => string | void;
    safeAttrValue?: (tag: string, name: string, value: string, cssFilter: any) => string;
    escapeHtml?: (html: string) => string;
    css?: { [key: string]: boolean };
  }

  interface IFilterXSSInstance {
    process(html: string): string;
    options: IXssOptions;
  }

  interface IFilterXSS {
    (html: string, options?: IXssOptions): string;
    FilterXSS: new (options?: IXssOptions) => IFilterXSSInstance;
  }

  const filterXSS: IFilterXSS;
  export = filterXSS;
} 