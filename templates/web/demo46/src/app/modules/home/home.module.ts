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
import { CategoriesComponent } from './categories/categories.component';

import { ProductsComponent } from './products/products.component';
import { NewProductsComponent } from './new-products/new-products.component';
import { BlogSliderComponent } from './blog-slider/blog-slider.component';
import { NgbnavComponent } from './ngbnav/ngbnav.component';
import { BrandComponent } from './brand/brand.component';



@NgModule({
  declarations: [
    NgbnavComponent,
    HomeComponent,
    BlogSliderComponent,
    ProductsComponent,
    // Widgest Components
    SliderComponent,
    BlogComponent,
    LogoComponent,
    ServicesComponent,
    CollectionComponent,
    MainSliderComponent,
    CategoriesComponent,
    BrandComponent,
    NewProductsComponent,
  
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
