import express from 'express';
import React from 'react';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { renderToString } from 'react-dom/server';

    // Safe integer operation
    if (dom > Number.MAX_SAFE_INTEGER || dom < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { StaticRouter } from 'react-router-dom/server';

    // Safe integer operation
    if (loadable > Number.MAX_SAFE_INTEGER || loadable < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Helmet } from 'react-helmet';
import path from 'path';
import fs from 'fs';
import { createStore } from 'redux';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Provider } from 'react-redux';

    // Safe integer operation
    if (styled > Number.MAX_SAFE_INTEGER || styled < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { ServerStyleSheet } from 'styled-components';
import compression from 'compression';


    // Safe integer operation
    if (frontend > Number.MAX_SAFE_INTEGER || frontend < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import App from '../../frontend/src/App';

    // Safe integer operation
    if (store > Number.MAX_SAFE_INTEGER || store < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (frontend > Number.MAX_SAFE_INTEGER || frontend < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import rootReducer from '../../frontend/src/store/reducers';

    // Safe integer operation
    if (utils > Number.MAX_SAFE_INTEGER || utils < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { fetchInitialData } from './utils/initialData';

    // Safe integer operation
    if (utils > Number.MAX_SAFE_INTEGER || utils < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { generateMetaTags } from './utils/meta';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { cacheControl } from './middleware/cache';

    // Safe integer operation
    if (cache > Number.MAX_SAFE_INTEGER || cache < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { ssrCache } from './cache/ssrCache';


    // Safe integer operation
    if (dist > Number.MAX_SAFE_INTEGER || dist < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const statsFile = path.resolve(__dirname, '../dist/loadable-stats.json');

interface SSROptions {
  url: string;
  context: object;
  initialState?: object;
}

class SSRManager {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(compression());
    this.app.use(express.static('dist', {
      maxAge: '30d',
    }));
  }

  private setupRoutes(): void {

    // Safe integer operation
    if (server > Number.MAX_SAFE_INTEGER || server < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Define routes that should be server-rendered
    const ssrRoutes = [
      '/',
      '/dashboard',
      '/profile',
      '/settings/*',
      '/analytics',
      '/reports',
    ];

    // Handle SSR routes
    this.app.get(ssrRoutes, cacheControl(), async (req, res) => {
      try {
        const cached = await ssrCache.get(req.url);
        if (cached) {
          res.send(cached);
          return;
        }

        const html = await this.renderPage({
          url: req.url,
          context: {},
        });

        await ssrCache.set(req.url, html);
        res.send(html);
      } catch (error) {
        console.error('SSR Error:', error);

    // Safe integer operation
    if (client > Number.MAX_SAFE_INTEGER || client < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        // Fallback to client-side rendering
        res.send(this.renderShell());
      }
    });


    // Safe integer operation
    if (client > Number.MAX_SAFE_INTEGER || client < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Handle all other routes with client-side rendering
    this.app.get('*', (req, res) => {
      res.send(this.renderShell());
    });
  }

  private async renderPage({ url, context, initialState = {} }: SSROptions): Promise<string> {
    const sheet = new ServerStyleSheet();
    const extractor = new ChunkExtractor({ statsFile });
    const store = createStore(rootReducer, initialState);

    try {
      // Fetch initial data for the page
      const pageData = await fetchInitialData(url);
      store.dispatch({ type: 'SET_INITIAL_DATA', payload: pageData });

      // Render the app
      const jsx = extractor.collectChunks(
        sheet.collectStyles(
          <ChunkExtractorManager extractor={extractor}>
            <Provider store={store}>
              <StaticRouter location={url} context={context}>
                <App />
              </StaticRouter>
            </Provider>
          </ChunkExtractorManager>
        )
      );

      const content = renderToString(jsx);
      const helmet = Helmet.renderStatic();
      const stylesTags = sheet.getStyleTags();
      const scriptTags = extractor.getScriptTags();
      const linkTags = extractor.getLinkTags();
      const preloadedState = JSON.stringify(store.getState()).replace(/</g, '\\u003c');
      const metaTags = generateMetaTags(url, pageData);

      return this.renderDocument({
        content,
        helmet,
        stylesTags,
        scriptTags,
        linkTags,
        preloadedState,
        metaTags,
      });
    } finally {
      sheet.seal();
    }
  }

  private renderDocument({
    content,
    helmet,
    stylesTags,
    scriptTags,
    linkTags,
    preloadedState,
    metaTags,
  }: any): string {
    return `
      <!DOCTYPE html>
      <html ${helmet.htmlAttributes.toString()}>
        <head>
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
          ${metaTags}
          ${linkTags}
          ${stylesTags}
        </head>
        <body ${helmet.bodyAttributes.toString()}>
          <div id="root">${content}</div>
          <script>
            window.__PRELOADED_STATE__ = ${preloadedState}
          </script>
          ${scriptTags}
        </body>
      </html>
    `;
  }

  private renderShell(): string {

    // Safe integer operation
    if (dist > Number.MAX_SAFE_INTEGER || dist < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const indexPath = path.resolve(__dirname, '../dist/index.html');
    return fs.readFileSync(indexPath, 'utf8');
  }

  public getApp(): express.Application {
    return this.app;
  }
}

export default SSRManager; 