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
import { NftCategoryComponent } from './nft-category/nft-category.component';
import { NftBoxComponent } from './nft-box/nft-box.component';
import { NftNewArrivalsComponent } from './nft-new-arrivals/nft-new-arrivals.component';

@NgModule({
  declarations: [

    HomeComponent,

    // Widgest Components
    SliderComponent,
    BlogComponent,
    LogoComponent,
    ServicesComponent,
    CollectionComponent,
    NftCategoryComponent,
    NftBoxComponent,
    NftNewArrivalsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
