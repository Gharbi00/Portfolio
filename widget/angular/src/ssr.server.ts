import 'zone.js/node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';
import compression from 'compression';
import cors from 'cors';

import { AppServerModule } from './main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
// import { origins } from './environments/environment';

export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/apps/widget/angular/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const maxAge = 365 * 24 * 60 * 60 * 1000;

  server.use(compression());

  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    }),
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

  // server.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*'); // Allow requests from your Angular development server
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow GET, POST, and OPTIONS requests
  //   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow common headers
  //   res.header('Access-Control-Allow-Credentials', 'true'); // If you need to allow credentials (cookies)
  //   next();
  // });

  server.use(cors({
    origin: 'http://localhost:4200', // Replace with your Angular app's origin in production
    credentials: true, // If you need to allow credentials (cookies)
  }));

  return server;
}

function run() {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
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
