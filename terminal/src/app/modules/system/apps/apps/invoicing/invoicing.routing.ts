import { Route } from '@angular/router';

import { InvoicingResolver } from './invoicing.resolvers';
import { InvoicingComponent } from './invoicing.component';

export const invoicingRoutes: Route[] = [
  {
    path: '',
    component: InvoicingComponent,
    resolve: {
      invoicing: InvoicingResolver,
    },
  },
];
