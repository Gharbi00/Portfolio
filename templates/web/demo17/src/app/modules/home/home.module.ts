import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { IndexComponent } from './index/index.component';
import { RestHomeComponent } from './rest-home/rest-home.component';
import { NewArrivalsComponent } from './new-arrivals/new-arrivals.component';
import { Product1Component } from './product1/product1.component';
import { Product2Component } from './product2/product2.component';
import { MainSliderComponent } from './main-slider/main-slider.component';

@NgModule({
  declarations: [IndexComponent, MainSliderComponent, NewArrivalsComponent, Product1Component, Product2Component, RestHomeComponent],

  imports: [CommonModule, HomeRoutingModule, SharedModule, CarouselModule],
})
export class HomeModule {}
