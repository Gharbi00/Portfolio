import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexComponent } from './home/home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ModulesRoutingModule } from './modules-routing.module';
import { CountUpModule } from 'ngx-countup';
import { LayoutModule } from '../shared/layout/layout.module';
import { AppService, LandingPagesService, PosService, SeoService, SlidesService, VisualsService } from '@sifca-monorepo/clients';
import { EcommerceGeneratorModule } from '@sifca-monorepo/ecommerce-generator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  providers: [AppService, PosService, SeoService, SlidesService, VisualsService, LandingPagesService],
  declarations: [IndexComponent],
  imports: [
    EcommerceGeneratorModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    CommonModule,
    CarouselModule,
    ModulesRoutingModule,
    CountUpModule,
    TranslateModule
  ],
  exports: [],
})
export class ModulesModule {}
