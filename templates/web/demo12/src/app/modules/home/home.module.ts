import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { IndexComponent } from './index/index.component';
import { MainSliderComponent } from './main-slider/main-slider.component';
import { CategorieComponent } from './categorie/categorie.component';
import { BestSellerComponent } from './best-seller/best-seller.component';
import { NewArrivalsComponent } from './new-arrivals/new-arrivals.component';
import { ProductAreaComponent } from './product-area/product-area.component';
import { AboutComponent } from './about/about.component';
import { PosterComponent } from './poster/poster.component';
import { ProductArea2Component } from './product-area2/product-area2.component';
import { TestimoialComponent } from './testimonial/testimonial.component';

@NgModule({
  declarations: [
    IndexComponent,
    MainSliderComponent,
    CategorieComponent,
    BestSellerComponent,
    NewArrivalsComponent,
    ProductAreaComponent,
  
    AboutComponent,
    PosterComponent,
    ProductArea2Component,
    TestimoialComponent,
  ],
  imports: [CommonModule, HomeRoutingModule, SharedModule, CarouselModule],
})
export class HomeModule {}
