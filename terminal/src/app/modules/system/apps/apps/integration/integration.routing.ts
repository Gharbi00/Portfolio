import { Route } from '@angular/router';

import { IntegrationResolver } from './integration.resolvers';
import { IntegrationComponent } from './integration.component';

export const integrationRoutes: Route[] = [
  {
    path: '',
    component: IntegrationComponent,
    resolve: {
      integration: IntegrationResolver,
    },
  },
];
