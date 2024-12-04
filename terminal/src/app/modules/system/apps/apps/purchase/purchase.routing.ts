import { Route } from '@angular/router';

import { PurchaseComponent } from './purchase.component';
import { PurchaseResolver } from './purchase.resolvers';

export const purchaseRoutes: Route[] = [
  {
    path: '',
    component: PurchaseComponent,
    resolve: {
      purchase: PurchaseResolver,
    },
  },
];
