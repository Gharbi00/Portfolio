import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ListComponent } from './list/list.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ShopRoutingModule } from './shop-routing.module';
import { DefaultComponent } from './product/default/default.component';
import { CarouselModule } from 'ngx-owl-carousel-o';

@NgModule({
  declarations: [CartComponent, CheckoutComponent, ListComponent, WishlistComponent, DefaultComponent],
  imports: [CommonModule, ShopRoutingModule, CarouselModule],
})
export class ShopModule {}
