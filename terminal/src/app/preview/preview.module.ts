import { DndModule } from 'ngx-drag-drop';
import { CommonModule } from '@angular/common';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { Route, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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

import { SharedModule } from '../shared/shared.module';
import { PreviewComponent } from './preview.component';
import { DocumentDetailsResolver } from './preview.resovers';
import { DocumentPreviewDetailPageComponent } from './page/page.component';
import { DocumentPreviewDetailsComponent } from './detail/detail.component';
import { SettingsResolver } from '../modules/system/settings/settings.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: PreviewComponent,
    children: [
      {
        path: ':token',
        component: DocumentPreviewDetailsComponent,
        resolve: {
          quotation: DocumentDetailsResolver,
        },
      },
      {
        path: 'p/:token',
        component: DocumentPreviewDetailPageComponent,
        resolve: {
          settings: SettingsResolver,
          quotation: DocumentDetailsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [PreviewComponent, DocumentPreviewDetailsComponent, DocumentPreviewDetailPageComponent],
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
    RouterModule.forChild(routes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PreviewModule {}
