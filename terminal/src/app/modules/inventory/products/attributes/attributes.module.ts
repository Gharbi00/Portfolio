import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { Route, RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import interactionPlugin from '@fullcalendar/interaction';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

import { AttributesResolver } from './attributes.resolvers';
import { AttributesComponent } from './attributes.component';
import { SharedModule } from '../../../../shared/shared.module';
import { AttributesListComponent } from './list/list.component';
import { TranslationResolver } from '../../../website/content/slides/slides.resolvers';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

export const routes: Route[] = [
  {
    path: '',
    component: AttributesComponent,
    resolve: {
      attributes: AttributesResolver,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AttributesListComponent,
        resolve: {
          translation: TranslationResolver,
        },
      },
      // {
      //   path: 'catalog/attributes/values',
      //   component: AttributeValuesListComponent,
      // },
    ],
  },
];

@NgModule({
  declarations: [AttributesComponent, AttributesListComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    PickerModule,
    DragDropModule,
    MatTableModule,
    FlexLayoutModule,
    Ng2SearchPipeModule,
    FullCalendarModule,
  ],
  providers: [AttributesResolver, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AttributesModule {}
