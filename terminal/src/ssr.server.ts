import 'zone.js/node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppServerModule } from './main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { BACKEND_HOST, POS_ID, environment } from './environments/environment';

function createProxyRoute(server, file) {
  server.use(
    file,
    createProxyMiddleware({
      target: environment.BACKEND_REST,
      changeOrigin: true,
      pathRewrite: {
        [file]: `/template${file}?pos=${POS_ID}`,
      },
      onProxyReq(proxyReq, req, res) {
        proxyReq.setHeader('Host', BACKEND_HOST);
        proxyReq.setHeader('Accept-Encoding', '');
      },
    }),
  );
}

export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/apps/terminal/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const maxAge = 365 * 24 * 60 * 60 * 1000;

  server.use(compression());

  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    }),
  );

  createProxyRoute(server, '/browserconfig.xml');
  createProxyRoute(server, '/site.webmanifest');

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // TODO: implement data requests securely
  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, { maxAge }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.debug(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './main.server';
