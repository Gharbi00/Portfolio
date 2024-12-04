import { Route } from '@angular/router';
import { IntegratorComponent } from './integrator.component';
import { GoogleResolver, PluginResolver } from './integrator.resolvers';

export const integratorRoutes: Route[] = [
  {
    path: '',
    component: IntegratorComponent,
    resolve: {
      integrator: GoogleResolver,
      plugin: PluginResolver,
    },
  },
];
