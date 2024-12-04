import { Route } from '@angular/router';

import { InventoryResolver } from './inventory.resolvers';
import { InventoryComponent } from './inventory.component';

export const inventoryRoutes: Route[] = [
  {
    path: '',
    component: InventoryComponent,
    resolve: {
      definitions: InventoryResolver,
    },
  },
];
