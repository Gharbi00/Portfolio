import { Route } from '@angular/router';
import { GoogleComponent } from './google.component';
import { GoogleResolver, PluginResolver } from './google.resolvers';

export const googleRoutes: Route[] = [
  {
    path: '',
    component: GoogleComponent,
    resolve: {
      google: GoogleResolver,
      plugin: PluginResolver,
    },
  },
];
