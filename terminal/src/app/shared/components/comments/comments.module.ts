import { NgxMaskModule } from 'ngx-mask';
import { LightboxModule } from 'ngx-lightbox';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbNavModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbTypeaheadModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { CommentsComponent } from './comments.component';

@NgModule({
  providers: [DatePipe],
  exports: [CommentsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [CommentsComponent],
  imports: [
    FormsModule,
    CommonModule,
    SwiperModule,
    NgbNavModule,
    PickerModule,
    CountToModule,
    NgxMaskModule,
    FeatherModule,
    MatIconModule,
    LightboxModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    NgbRatingModule,
    NgxSliderModule,
    MatButtonModule,
    MatDialogModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgbTooltipModule,
    NgxBarcodeModule,
    NgbDropdownModule,
    FullCalendarModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
  ],
})
export class CommentsModule {}
