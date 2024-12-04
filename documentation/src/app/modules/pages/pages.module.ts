import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Error404Component } from './error404/error404.component';

import { CarouselModule } from 'ngx-owl-carousel-o';
import { PagesRoutingModule } from './pages-routing.module';

@NgModule({
  declarations: [Error404Component],
  imports: [CommonModule, PagesRoutingModule, CarouselModule],
  exports: [RouterModule],
})
export class PagesModule {}
