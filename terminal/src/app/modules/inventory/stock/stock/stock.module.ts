import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbPaginationModule,
  NgbTypeaheadModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbNavModule,
  NgbRatingModule,
  NgbProgressbarModule,
  NgbCollapseModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SimplebarAngularModule } from 'simplebar-angular';
import { ArchwizardModule } from 'angular-archwizard';
import { CountToModule } from 'angular-count-to';
import { DndModule } from 'ngx-drag-drop';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { StockComponent } from './stock.component';
import { StockListComponent } from './list/list.component';
import { StockResolver } from './stock.resovers';
import { NgxBarcodeModule } from 'ngx-barcode';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  {
    path: '',
    component: StockComponent,
    children: [
      {
        path: '',
        component: StockListComponent,
        resolve: {
          category: StockResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [StockComponent, StockListComponent],
  imports: [
    RouterModule.forChild(routes),
    NgxBarcodeModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    InfiniteScrollModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgSelectModule,
    MatTooltipModule,
    SharedModule,
    FlatpickrModule.forRoot(),
    NgbNavModule,
    NgbRatingModule,
    NgxSliderModule,
    SimplebarAngularModule,
    SwiperModule,
    ArchwizardModule,
    CountToModule,
    NgbProgressbarModule,
    DndModule,
    NgbCollapseModule,
    PickerModule,
    DragDropModule,
    MatTableModule,
    FlexLayoutModule,
    Ng2SearchPipeModule,
    FullCalendarModule,
  ],
  providers: [StockResolver, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockModule {}
