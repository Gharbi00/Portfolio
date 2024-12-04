import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { IndexComponent } from './index/index.component';
import { MainSliderComponent } from './main-slider/main-slider.component';
import { CategorieComponent } from './categorie/categorie.component';
import { BestSellerComponent } from './best-seller/best-seller.component';

@NgModule({
  declarations: [IndexComponent, MainSliderComponent, CategorieComponent, BestSellerComponent],
  imports: [CommonModule, HomeRoutingModule, SharedModule, CarouselModule],
})
export class HomeModule {}
