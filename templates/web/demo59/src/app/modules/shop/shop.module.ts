import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../../shared/shared.module';
import { ShopRoutingModule } from './shop-routing.module';

// Product Details Components
import { ProductComponent } from './product/product.component';



// Product Details Widgest Components
import { ServicesComponent } from './product/widgets/services/services.component';
import { CountdownComponent } from './product/widgets/countdown/countdown.component';
import { SocialComponent } from './product/widgets/social/social.component';
import { StockInventoryComponent } from './product/widgets/stock-inventory/stock-inventory.component';
import { RelatedProductComponent } from './product/widgets/related-product/related-product.component';



import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CompareComponent } from './compare/compare.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './checkout/success/success.component';

import {RouterModule} from '@angular/router';
import { ShopListComponent } from './list/list.component';
import { BrandsComponent } from './widgets/brands/brands.component';
import { ColorsComponent } from './widgets/colors/colors.component';
import { GridComponent } from './widgets/grid/grid.component';
import { PaginationComponent } from './widgets/pagination/pagination.component';
import { PriceComponent } from './widgets/price/price.component';
import { SizeComponent } from './widgets/size/size.component';

@NgModule({
  declarations: [
    ShopListComponent,
    ProductComponent, 

    ServicesComponent,
    CountdownComponent,
    SocialComponent,
    StockInventoryComponent,
    RelatedProductComponent,
    CartComponent,
    WishlistComponent,
    CompareComponent,
    CheckoutComponent,
    SuccessComponent,
    BrandsComponent,
    ColorsComponent,
    GridComponent,
    PaginationComponent,
    PriceComponent,
    SizeComponent,
  ],
  imports: [
    CommonModule,
    NgxSliderModule,
    InfiniteScrollModule,
    SharedModule,
    ShopRoutingModule,
    RouterModule
  ]
})
export class ShopModule { }
