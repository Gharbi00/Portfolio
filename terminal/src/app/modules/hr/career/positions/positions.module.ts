import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SimplebarAngularModule } from 'simplebar-angular';
import { TranslateModule } from '@ngx-translate/core';
import { DndModule } from 'ngx-drag-drop';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { allIcons } from 'angular-feather/icons';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ArchwizardModule } from 'angular-archwizard';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { PositionsComponent } from './positions.component';
import { PositionsListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { PositionDetailsComponent } from './details/details.component';
import { JobDepartmentResolver, PositionDetailsResolver, PositionsResolver } from './positions.resovers';
import { TranslationResolver } from '../../../website/content/slides/slides.resolvers';
import { QuillModule } from 'ngx-quill';

export const routes: Route[] = [
  {
    path: '',
    component: PositionsComponent,
    children: [
      {
        path: 'all',
        component: PositionsListComponent,
        resolve: {
          positions: PositionsResolver,
          translation: TranslationResolver,
        },
      },
      {
        path: ':id',
        component: PositionDetailsComponent,
        resolve: {
          translation: TranslationResolver,
          position: PositionDetailsResolver,
          departments: JobDepartmentResolver,
        },
      },
      {
        path: '',
        redirectTo: 'all',
      },
    ],
  },
];

@NgModule({
  providers: [JobDepartmentResolver, PositionsResolver, PositionDetailsResolver],
  declarations: [PositionsComponent, PositionsListComponent, PositionDetailsComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    QuillModule,
    FormsModule,
    ReactiveFormsModule,
    NgxBarcodeModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbDropdownModule,
    MatTooltipModule,
    NgbAccordionModule,
    NgSelectModule,
    SharedModule,
    FlatpickrModule,
    TranslateModule,
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
    FeatherModule.pick(allIcons),
    PickerModule,
    DragDropModule,
    MatTableModule,
    FlexLayoutModule,
    Ng2SearchPipeModule,
    FullCalendarModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PositionsModule {}
