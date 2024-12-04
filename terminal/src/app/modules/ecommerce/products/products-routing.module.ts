import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'groups',
    loadChildren: () => import('./groups/product-group.module').then((m) => m.ProductGroupModule),
  },
  {
    path: 'ratings',
    loadChildren: () => import('./rating/rating.module').then((m) => m.RatingModule),
  },
  {
    path: 'clicks',
    loadChildren: () => import('./clicks/clicks.module').then((m) => m.ClicksModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
