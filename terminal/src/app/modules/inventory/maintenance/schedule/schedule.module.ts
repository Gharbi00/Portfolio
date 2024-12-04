import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

import { SwiperModule } from 'ngx-swiper-wrapper';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SimplebarAngularModule } from 'simplebar-angular';
import { ArchwizardModule } from 'angular-archwizard';
import { CountToModule } from 'angular-count-to';
import { DndModule } from 'ngx-drag-drop';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { InventoryRoutingModule } from '../../inventory-routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ScheduleComponent } from './schedule.component';
import { KanbanComponent } from './kanban/kanban.component';
import { ListViewComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';
import { BoardListResolver, CardTimeTracksResolver, ScheduleDetailsResolver, ScheduleResolver } from './schedule.resovers';
import { ArchivedComponent } from '../../../crm/pipeline/archived/archived.component';
import { ArchivedResolver } from '../../../crm/pipeline/archived/archived.resovers';
import { NgxFileDropModule } from 'ngx-file-drop';
import { TranslateModule } from '@ngx-translate/core';

export const routes: Route[] = [
  {
    path: '',
    component: ScheduleComponent,
    children: [
      {
        path: '',
        component: KanbanComponent,
        resolve: {
          equipments: ScheduleResolver,
        },
      },
      {
        path: 'list/:id',
        component: ListViewComponent,
        resolve: {
          equipments: BoardListResolver,
        },
      },
      {
        path: 'archived/:id',
        component: ArchivedComponent,
        resolve: {
          archived: ArchivedResolver,
        },
      },
      {
        path: ':id',
        component: DetailsComponent,
        resolve: {
          product: ScheduleDetailsResolver,
          // comments: CardCommentsResolver,
          times: CardTimeTracksResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [ScheduleComponent, KanbanComponent, ListViewComponent, DetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxBarcodeModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgSelectModule,
    InventoryRoutingModule,
    TranslateModule,
    SharedModule,
    FlatpickrModule.forRoot(),
    NgbNavModule,
    NgbRatingModule,
    NgxSliderModule,
    SimplebarAngularModule,
    SwiperModule,
    NgxFileDropModule,
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
    RouterModule.forChild(routes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EquipmentsModule {}
