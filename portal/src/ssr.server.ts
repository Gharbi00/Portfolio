import 'zone.js/node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppServerModule } from './main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { POS_ID, bck_host, bck_url } from './environments/environment';

// Increase the maximum number of listeners to avoid warning
process.setMaxListeners(0);

// Optimize zone.js for server-side rendering
(global as any).__Zone_disable_requestAnimationFrame = true;

function createProxyRoute(server, file) {
  server.use(
    file,
    createProxyMiddleware({
      target: bck_url,
      changeOrigin: true,
      pathRewrite: {
        [file]: `/template${file}?pos=${POS_ID}`,
      },
      onProxyReq(proxyReq, req, res) {
        proxyReq.setHeader('Host', bck_host);
        proxyReq.setHeader('Accept-Encoding', '');
      },
    })
  );
}

export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/apps/portal/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const maxAge = 365 * 24 * 60 * 60 * 1000;

  server.use(compression());

  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    }),
  );

  createProxyRoute(server, '/sitemap.xml');
  createProxyRoute(server, '/robots.txt');
  createProxyRoute(server, '/browserconfig.xml');
  createProxyRoute(server, '/site.webmanifest');
  createProxyRoute(server, '/ads.txt');
  server.use(
    '/meta-catalog.xml',
    createProxyMiddleware({
      target: bck_url,
      changeOrigin: true,
      pathRewrite: {
        ['/meta-catalog.xml']: `/meta/${POS_ID}`,
      },
      onProxyReq(proxyReq, req, res) {
        proxyReq.setHeader('Host', bck_host);
        proxyReq.setHeader('Accept-Encoding', '');
      },
    })
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  server.get('*.*', express.static(distFolder, { maxAge }));

  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env['PORT'] || 4000;

  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './main.server';
