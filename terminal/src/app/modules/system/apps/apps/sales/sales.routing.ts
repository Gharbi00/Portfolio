import { Route } from '@angular/router';

import { SalesComponent } from './sales.component';
import { SettingsResolver } from './sales.resolvers';

export const salesRoutes: Route[] = [
  {
    path: '',
    component: SalesComponent,
    resolve: {
      definitions: SettingsResolver,
    },
  },
];
