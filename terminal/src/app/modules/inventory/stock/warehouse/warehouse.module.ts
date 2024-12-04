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
import { WarehouseListComponent } from './list/list.component';
import { WarehouseComponent } from './warehouse.component';
import { WarehouseResolver } from './warehouse.resovers';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const routes: Routes = [
  {
    path: '',
    component: WarehouseComponent,
    children: [
      {
        path: '',
        component: WarehouseListComponent,
        resolve: {
          category: WarehouseResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [WarehouseComponent, WarehouseListComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    InfiniteScrollModule,
    TranslateModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgSelectModule,
    SharedModule,
    FlatpickrModule,
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
    // FeatherModule.pick(allIcons),
    PickerModule,
    DragDropModule,
    MatTableModule,
    FlexLayoutModule,
    Ng2SearchPipeModule,
    FullCalendarModule,
  ],
  providers: [WarehouseResolver, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WarehouseModule {}
