import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { IndexComponent } from './index/index.component';


import { BestSellerComponent } from './best-seller/best-seller.component';
import { CategorieComponent } from './categorie/categorie.component';
import { MainSliderComponent } from './main-slider/main-slider.component';
import { NewArrivalsComponent } from './new-arrivals/new-arrivals.component';
import { NewArrivals0Component } from './new-arrivals0/new-arrivals0.component';
import { ProductComponent } from './product/product.component';
import { TestimoialComponent } from './testimonial/testimonial.component';

@NgModule({
  declarations: [
    IndexComponent,
    BestSellerComponent,
    CategorieComponent,
    MainSliderComponent,
    NewArrivalsComponent,
    NewArrivals0Component,
    ProductComponent,
    TestimoialComponent,
  ],
  imports: [CommonModule, HomeRoutingModule, SharedModule, CarouselModule],
})
export class HomeModule {}
