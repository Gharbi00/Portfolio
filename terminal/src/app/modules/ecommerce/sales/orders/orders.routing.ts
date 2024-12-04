import { Route } from '@angular/router';

import { OrdersComponent } from './orders.component';
import { OrdersListComponent } from './list/list.component';
import { AddOrderComponent } from './order/add-order.component';
import { AddOrderResolver, OrdersResolver, SearchOrdersResolver } from './orders.resolvers';

export const ordersRoutes: Route[] = [
  {
    path: '',
    component: OrdersComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OrdersListComponent,
        resolve: {
          orders: OrdersResolver,
        },
      },
      {
        path: 'order/:id',
        component: OrdersListComponent,
        resolve: {
          orders: SearchOrdersResolver,
        },
      },
      {
        path: 'add-order',
        component: AddOrderComponent,
        resolve: {
          users: AddOrderResolver,
        },
      },
    ],
  },
];
