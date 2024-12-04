import { Route } from '@angular/router';
import { LoyaltyComponent } from './loyalty.component';
import { LoyaltyDetailsResolver, LoyaltyLevelResolver, LoyaltyResolver } from './loyalty.resolvers';

export const loyaltyRoutes: Route[] = [
  {
    path: '',
    component: LoyaltyComponent,
    resolve: {
      settings: LoyaltyResolver,
      plugin: LoyaltyDetailsResolver,
      level: LoyaltyLevelResolver,
    },
  },
];
