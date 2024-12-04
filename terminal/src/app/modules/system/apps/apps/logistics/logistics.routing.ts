import { Route } from '@angular/router';

import { LogisticsComponent } from './logistics.component';
import { LogisticCompaniesResolver, LogisticsResolver } from './logistics.resolvers';

export const logisticsRoutes: Route[] = [
  {
    path: '',
    component: LogisticsComponent,
    resolve: {
      logistics: LogisticsResolver,
      company: LogisticCompaniesResolver,
    },
  },
];
