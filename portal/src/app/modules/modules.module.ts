import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';

import { IndexComponent } from './home/home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ModulesRoutingModule } from './modules-routing.module';
import { CountUpModule } from 'ngx-countup';
import { LosingCustomersComponent } from './engage/engage.component';

import { CompetitionComponent } from './collect/collect.component';
import { MonetizeCommunityComponent } from './monetize/monetize.component';
import { GrowRevenueComponent } from './grow/grow.component';
import { BlogIndexComponent } from './home/blog/blog-index.component';
import { LayoutModule } from '../shared/layout/layout.module';
import { AppService, LandingPagesService, SeoService, SlidesService, VisualsService } from '@sifca-monorepo/clients';
import { EcommerceGeneratorModule } from '@sifca-monorepo/ecommerce-generator';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  providers: [SeoService, SlidesService, VisualsService, AppService, LandingPagesService],
  declarations: [
    IndexComponent,
    BlogIndexComponent,
    LosingCustomersComponent,
    CompetitionComponent,
    MonetizeCommunityComponent,
    GrowRevenueComponent,
  ],
  imports: [EcommerceGeneratorModule, LayoutModule, CommonModule, QuillModule, CarouselModule, ModulesRoutingModule, CountUpModule, TranslateModule],
})
export class ModulesModule {}
