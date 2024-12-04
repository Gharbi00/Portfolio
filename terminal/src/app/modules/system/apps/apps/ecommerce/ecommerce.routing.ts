import { Route } from '@angular/router';
import { EcommerceComponent } from './ecommerce.component';
import { EcommerceSettingsResolver, EmailsResolver } from './ecommerce.resolvers';
import { SmsIntegrationResolver } from '../website/website.resolvers';

export const ecommerceRoutes: Route[] = [
  {
    path: '',
    component: EcommerceComponent,
    resolve: {
      emails: EmailsResolver,
      sms: SmsIntegrationResolver,
      definitions: EcommerceSettingsResolver,
    },
  },
];
