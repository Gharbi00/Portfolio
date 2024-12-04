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
import { InstagramComponent } from './instagram/instagram.component';
import { SpecialOfferComponent } from './special-offer/special-offer.component';
import { BlogSliderComponent } from './blog-slider/blog-slider.component';

@NgModule({
  declarations: [

    HomeComponent,
    BlogSliderComponent,
    // Widgest Components
    SliderComponent,
    BlogComponent,
    LogoComponent,
    ServicesComponent,
    CollectionComponent,
    MainSliderComponent,
    InstagramComponent,
    SpecialOfferComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
