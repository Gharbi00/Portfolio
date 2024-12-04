import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ListComponent } from './list/list.component';
import { DefaultComponent } from './product/default/default.component';

import { WishlistComponent } from './wishlist/wishlist.component';

const routes: Routes = [
  { path: 'shop', component: ListComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'product', component: DefaultComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ShopRoutingModule {}
