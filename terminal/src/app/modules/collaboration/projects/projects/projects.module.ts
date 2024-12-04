import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
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

import { ProjectsComponent } from './projects.component';
import { ProjectsListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ProjetCreateComponent } from './create/create.component';
import { ProjectOverviewComponent } from './overview/overview.component';
import { DataResolver } from '../../../shared/resolvers/invoicing.resolver';
import { CommentsModule } from '../../../../shared/components/comments/comments.module';
import { ProjectCommentsResolver, ProjectDetailsResolver, ProjectsResolver } from './projects.resolver';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

export const routes: Route[] = [
  {
    path: '',
    component: ProjectsComponent,
    children: [
      {
        path: 'all',
        component: ProjectsListComponent,
        resolve: {
          projects: ProjectsResolver,
        },
      },
      {
        path: 'e/:id',
        component: ProjetCreateComponent,
        resolve: {
          project: ProjectDetailsResolver,
        },
      },
      {
        path: 'view/:id',
        component: ProjectOverviewComponent,
        data: { commentHolder: 'project', commentService: 'projectsService', commentServiceAttribute: 'project' },
        resolve: {
          data: DataResolver,
          project: ProjectDetailsResolver,
          comments: ProjectCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ProjectsComponent, ProjectsListComponent, ProjetCreateComponent, ProjectOverviewComponent],
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
    CommentsModule,
    NgxFileDropModule,
    TranslateModule,
    DragDropModule,
    MatTableModule,
    NgSelectModule,
    NgbRatingModule,
    NgxSliderModule,
    NgbTooltipModule,
    MatTooltipModule,
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
    MatProgressSpinnerModule,
    FlatpickrModule.forRoot(),
  ],
})
export class ProjectsModule {}
