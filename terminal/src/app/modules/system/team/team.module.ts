import { AgmCoreModule } from '@agm/core';
import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Route, RouterModule } from '@angular/router';
import { ArchwizardModule } from 'angular-archwizard';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
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
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FlexModule } from '@angular/flex-layout';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';

import { TeamComponent } from './team.component';
import { TeamListComponent } from './list/list.component';
import { TeamEditComponent } from './edit/edit.component';
import { SharedModule } from '../../../shared/shared.module';
import { TeamDetailsComponent } from './details/details.component';
import { TeamDetailsResolver, TeamResolver, UserDocumentsResolver, UserProjectsResolver } from './team.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: TeamComponent,
    children: [
      {
        path: '',
        component: TeamListComponent,
        resolve: {
          team: TeamResolver,
        },
      },
      {
        path: 'edit/:id',
        component: TeamEditComponent,
        resolve: {
          user: TeamDetailsResolver,
        },
      },
      {
        path: 'details/:id',
        component: TeamDetailsComponent,
        resolve: {
          user: TeamDetailsResolver,
          team: TeamResolver,
          projects: UserProjectsResolver,
          documents: UserDocumentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [    TeamResolver,
    TeamDetailsResolver, UserProjectsResolver, UserDocumentsResolver, UserDocumentsResolver],
  declarations: [TeamComponent, TeamListComponent, TeamDetailsComponent, TeamEditComponent],
  imports: [
    RouterModule.forChild(routes),
    FlexModule,
    CommonModule,
    FormsModule,
    AgmCoreModule,
    ReactiveFormsModule,
    NgxBarcodeModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbDropdownModule,
    InfiniteScrollModule,
    NgbAccordionModule,
    NgSelectModule,
    SharedModule,
    FlatpickrModule,
    NgbNavModule,
    NgbRatingModule,
    NgxSliderModule,
    TranslateModule,
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
export class TeamModule {}
