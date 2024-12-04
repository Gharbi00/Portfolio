import '@angular/compiler';
import 'zone.js';
import 'zone.js/dist/zone-error';
import '@angular/localize/init';
import 'core-js/proposals/reflect-metadata';
import 'hammerjs/hammer';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import './styles.scss';
import { BASE_URL, environment } from './environments/environment';
import { enableProdMode } from '@angular/core';

if (environment.production) {
  enableProdMode();
}

const appRoot = document.createElement('fw-root');
document.body.appendChild(appRoot);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `${BASE_URL}/assets/styles.css`;
document.head.appendChild(link);

function bootstrap() {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}

if (document.readyState === 'complete') {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', bootstrap);
}
