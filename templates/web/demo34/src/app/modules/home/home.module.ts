import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';


// Widgest Components
import { SliderComponent } from './widgets/slider/slider.component';
import { BlogComponent } from './widgets/blog/blog.component';
import { LogoComponent } from './widgets/logo/logo.component';
import { ServicesComponent } from './widgets/services/services.component';
import { CollectionComponent } from './widgets/collection/collection.component';

import { MainSliderComponent } from './main-slider/main-slider.component';
import { TrendingProductsComponent } from './trending-products/trending-products.component';
import { BrandComponent } from './brand/brand.component';
import { NgbnavComponent } from './ngbnav/ngbnav.component';

@NgModule({
  declarations: [

    HomeComponent,
    // Widgest Components
    SliderComponent,
    BlogComponent,
    LogoComponent,
    ServicesComponent,
    CollectionComponent,
    MainSliderComponent,
    TrendingProductsComponent,
    BrandComponent,
    NgbnavComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
