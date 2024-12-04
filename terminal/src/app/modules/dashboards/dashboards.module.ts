import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountToModule } from 'angular-count-to';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { DashboardsRoutingModule } from './dashboards-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { WidgetModule } from '../../shared/widget/widget.module';
import { AnalyticsComponent } from './analytics/analytics.component';
import { CrmComponent } from './crm/crm.component';
import { CollaborationDashboardComponent } from './collaboration/collaboration.component';
import { SalesDashboardComponent } from './sales/sales.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ArchwizardModule } from 'angular-archwizard';
import { EcommerceDashboardComponent } from './ecommerce/ecommerce.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
};

@NgModule({
  declarations: [AnalyticsComponent, CrmComponent, SalesDashboardComponent, CollaborationDashboardComponent, EcommerceDashboardComponent],
  imports: [
    FormsModule,
    CommonModule,
    NgbNavModule,
    SwiperModule,
    SharedModule,
    WidgetModule,
    CountToModule,
    LeafletModule,
    NgbToastModule,
    LightboxModule,
    NgSelectModule,
    TranslateModule,
    NgbRatingModule,
    NgxSliderModule,
    NgbTooltipModule,
    ArchwizardModule,
    NgbDropdownModule,
    NgApexchartsModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    InfiniteScrollModule,
    SimplebarAngularModule,
    DashboardsRoutingModule,
    FlatpickrModule.forRoot(),
    FeatherModule.pick(allIcons),
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
})
export class DashboardsModule {}
