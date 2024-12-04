import { Route } from '@angular/router';

import { SmsIntegrationResolver } from './sms-integration.resolvers';
import { SmsIntegrationComponent } from './sms-integration.component';

export const smsIntegrationRoutes: Route[] = [
  {
    path: '',
    component: SmsIntegrationComponent,
    resolve: {
      integration: SmsIntegrationResolver,
    },
  },
];
