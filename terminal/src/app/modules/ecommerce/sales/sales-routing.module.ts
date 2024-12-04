import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then((m) => m.OrdersModule),
  },
  {
    path: 'carts',
    loadChildren: () => import('./cart/open-carts.module').then((m) => m.OpenCartsModule),
  },
  {
    path: 'coupons',
    loadChildren: () => import('./coupons/coupons.module').then((m) => m.CouponsModule),
  },
  {
    path: 'promotions',
    loadChildren: () => import('./promotions/promotions.module').then((m) => m.PromotionsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
