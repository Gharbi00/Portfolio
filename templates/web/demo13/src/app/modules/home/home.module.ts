import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { HomeRoutingModule } from './home-routing.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { RestHomeContentComponent } from './rest-home-content/rest-home-content.component';
import { CategorieComponent } from './categorie/categorie.component';
import { MainSliderComponent } from './main-slider/main-slider.component';
import { NewArrivalsComponent } from './new-arrivals/new-arrivals.component';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { PosterComponent } from './poster/poster.component';
import { ProductComponent } from './product/product.component';
import { TestimoialComponent } from './testimonial/testimonial.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    IndexComponent,
    RestHomeContentComponent,
    CategorieComponent,
    MainSliderComponent,
    NewArrivalsComponent,
    NewsletterComponent,
    PosterComponent,
    ProductComponent,
    TestimoialComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    CarouselModule
  ],
})
export class HomeModule { }
