import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { NgxFileDropModule } from 'ngx-file-drop';
import { allIcons } from 'angular-feather/icons';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { TranslateModule } from '@ngx-translate/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { ArchwizardModule } from 'angular-archwizard';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  NgbNavModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbTypeaheadModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { TicketsComponent } from './tickets.component';
import { SharedModule } from '../../../shared/shared.module';
import { TicketsListComponent } from './list/list.component';
import { TicketsDetailsComponent } from './details/details.component';
import { DataResolver } from '../../shared/resolvers/invoicing.resolver';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { TicketCommentsResolver, TicketDetailsResolver, TicketsResolver, TicketsStats } from './tickets.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: TicketsComponent,
    children: [
      {
        path: '',
        component: TicketsListComponent,
        resolve: {
          stats: TicketsStats,
          tickets: TicketsResolver,
        },
      },
      {
        path: ':id',
        component: TicketsDetailsComponent,
        data: { commentHolder: 'ticket', commentService: 'ticketsService', commentServiceAttribute: 'ticket' },
        resolve: {
          data: DataResolver,
          ticket: TicketDetailsResolver,
          comments: TicketCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [TicketsComponent, TicketsListComponent, TicketsDetailsComponent],
  imports: [
    RouterModule.forChild(routes),
    DndModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    NgSelectModule,
    CommentsModule,
    TranslateModule,
    DragDropModule,
    MatTableModule,
    NgbRatingModule,
    NgxSliderModule,
    NgxBarcodeModule,
    NgbTooltipModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgbDropdownModule,
    NgxFileDropModule,
    NgbCollapseModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    InfiniteScrollModule,
    SimplebarAngularModule,
    MatProgressSpinnerModule,
    FlatpickrModule.forRoot(),
    FeatherModule.pick(allIcons),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TicketsModule {}
