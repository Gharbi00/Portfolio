import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { SharedModule } from '../../../shared/shared.module';
import { BrandsComponent } from './brands.component';
import { BrandsListComponent } from './list/list.component';
import { BrandDetailComponent } from './detail/detail.component';
import { BrandResolver, BrandDetailsResolver } from './brands.resovers';

const routes: Routes = [
  {
    path: '',
    component: BrandsComponent,
    children: [
      {
        path: '',
        component: BrandsListComponent,
        resolve: {
          brands: BrandResolver,
        },
      },
      {
        path: ':id',
        component: BrandDetailComponent,
        resolve: {
          brands: BrandDetailsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [BrandsComponent, BrandsListComponent, BrandDetailComponent],
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
    DragDropModule,
    MatTableModule,
    FlatpickrModule,
    TranslateModule,
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
  ],
  providers: [BrandResolver, BrandDetailsResolver, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BrandsModule {}
