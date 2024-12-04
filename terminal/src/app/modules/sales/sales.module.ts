import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
// import dayGridPlugin from '@fullcalendar/daygrid';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
// import interactionPlugin from '@fullcalendar/interaction';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import {
  NgbNavModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbCollapseModule,
  NgbTypeaheadModule,
  NgbAccordionModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../../shared/shared.module';
import { SalesRoutingModule } from './sales-routing.module';
import { RentalCalendarComponent } from './rental/calendar/rental-calendar.component';
import { RentalOrdersComponent } from './rental/orders/orders/rental-orders.component';
import { RentalOrdersDetailsComponent } from './rental/orders/orders-details/rental-orders-details.component';
import { TranslateModule } from '@ngx-translate/core';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  slidesPerView: 'auto',
  direction: 'horizontal',
};
// FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
  declarations: [RentalOrdersComponent, RentalCalendarComponent, RentalOrdersDetailsComponent],
  imports: [
    SalesRoutingModule,
    TranslateModule,
    DndModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    NgbRatingModule,
    NgxSliderModule,
    NgbTooltipModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
  ],
})
export class SalesModule {}
