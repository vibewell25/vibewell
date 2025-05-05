import express from 'express';
import React from 'react';

    import { renderToString } from 'react-dom/server';

    import { StaticRouter } from 'react-router-dom/server';

    import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';

    import { Helmet } from 'react-helmet';
import path from 'path';
import fs from 'fs';
import { createStore } from 'redux';

    import { Provider } from 'react-redux';

    import { ServerStyleSheet } from 'styled-components';
import compression from 'compression';


    import App from '../../frontend/src/App';

    import rootReducer from '../../frontend/src/store/reducers';

    import { fetchInitialData } from './utils/initialData';

    import { generateMetaTags } from './utils/meta';

    import { cacheControl } from './middleware/cache';

    import { ssrCache } from './cache/ssrCache';


    const statsFile = path.resolve(__dirname, '../dist/loadable-stats.json');

interface SSROptions {
  url: string;
  context: object;
  initialState?: object;
class SSRManager {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
private setupMiddleware(): void {
    this.app.use(compression());
    this.app.use(express.static('dist', {
      maxAge: '30d',
));
private setupRoutes(): void {

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
const html = await this.renderPage({
          url: req.url,
          context: {},
await ssrCache.set(req.url, html);
        res.send(html);
catch (error) {
        console.error('SSR Error:', error);

    // Fallback to client-side rendering
        res.send(this.renderShell());
// Handle all other routes with client-side rendering
    this.app.get('*', (req, res) => {
      res.send(this.renderShell());
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
finally {
      sheet.seal();
private renderDocument({
    content,
    helmet,
    stylesTags,
    scriptTags,
    linkTags,
    preloadedState,
    metaTags,
: any): string {
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
private renderShell(): string {

    const indexPath = path.resolve(__dirname, '../dist/index.html');
    return fs.readFileSync(indexPath, 'utf8');
public getApp(): express.Application {
    return this.app;
export default SSRManager; 