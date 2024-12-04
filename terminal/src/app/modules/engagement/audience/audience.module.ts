import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { SWIPER_CONFIG, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { NgxFileDropModule } from 'ngx-file-drop';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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

import { AudiencesComponent } from './audience.component';
import { SharedModule } from '../../../shared/shared.module';
import { AudiencesListComponent } from './list/list.component';
import { AudienceDetailsResolver, AudiencesResolver } from './audience.resolver';
import { CommentsModule } from '../../../shared/components/comments/comments.module';

import { AgmCoreModule } from '@agm/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { AudienceDetailsComponent } from './details/details.component';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

export const routes: Route[] = [
  {
    path: '',
    component: AudiencesComponent,
    children: [
      {
        path: '',
        component: AudiencesListComponent,
        resolve: {
          audiences: AudiencesResolver,
        },
      },
      {
        path: ':id',
        component: AudienceDetailsComponent,
        resolve: {
          audienceDetails: AudienceDetailsResolver,
        }
      },
      {
        path: 'default/:id',
        component: AudienceDetailsComponent,
        resolve: {
          audienceDetails: AudienceDetailsResolver,
        }
      },
    ],
  },
];

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  slidesPerView: 'auto',
  direction: 'horizontal',
};

@NgModule({
  providers: [AudiencesResolver, AudienceDetailsResolver, DatePipe, { provide: SWIPER_CONFIG, useValue: DEFAULT_SWIPER_CONFIG }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AudiencesComponent, AudiencesListComponent, AudienceDetailsComponent],
  imports: [
    RouterModule.forChild(routes),
    DndModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    PickerModule,
    CountToModule,
    AgmCoreModule,
    CommentsModule,
    DragDropModule,
    MatTableModule,
    NgSelectModule,
    FlatpickrModule,
    TranslateModule,
    NgbRatingModule,
    NgxSliderModule,
    MatSelectModule,
    NgbTooltipModule,
    MatTooltipModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgxFileDropModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    NgxUsefulSwiperModule,
    SimplebarAngularModule,
    MatProgressSpinnerModule
  ],
})
export class AudiencesModule {}
