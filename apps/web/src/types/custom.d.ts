/**
 * Custom type declarations for external modules
 */

declare module 'puppeteer' {
  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }

  export interface Page {
    setContent(html: string, options?: { waitUntil?: string }): Promise<void>;
    addStyleTag(options: { content: string }): Promise<void>;
    pdf(options: {
      path: string;
      format?: string;
      printBackground?: boolean;
      margin?: {
        top: string;
        right: string;
        bottom: string;
        left: string;
      };
    }): Promise<Buffer>;
  }

  export function launch(options?: {
    headless?: boolean | 'new';
    args?: string[];
  }): Promise<Browser>;
} 