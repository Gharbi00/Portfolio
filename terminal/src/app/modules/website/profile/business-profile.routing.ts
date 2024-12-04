import { Route } from '@angular/router';
import { BusinessProfileComponent } from './business-profile.component';
import { ProfilePaymentMethodResolver, ProfileSocialsResolver } from './business-profile.resolvers';

export const businessProfileRoutes: Route[] = [
  {
    path: '',
    component: BusinessProfileComponent,
    resolve: {
      socials: ProfileSocialsResolver,
      paymentMehods: ProfilePaymentMethodResolver,
    },
  },
];
