import { Route } from '@angular/router';
import { KycComponent } from './kyc.component';
import { KycResolver, PluginResolver } from './kyc.resolvers';

export const kycRoutes: Route[] = [
  {
    path: '',
    component: KycComponent,
    resolve: {
      loyalty: KycResolver,
      plugin: PluginResolver,
    },
  },
];
