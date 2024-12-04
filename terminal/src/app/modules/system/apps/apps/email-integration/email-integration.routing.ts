import { Route } from '@angular/router';

import { EmailIntegrationComponent } from './email-integration.component';
import { EmailIntegrationResolver } from './email-integration.resolvers';

export const emailIntegrationRoutes: Route[] = [
  {
    path: '',
    component: EmailIntegrationComponent,
    resolve: {
      widget: EmailIntegrationResolver,
    },
  },
];
