import { CommonModule, DatePipe } from '@angular/common';
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
import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { TranslateModule } from '@ngx-translate/core';
import { SwiperModule } from 'ngx-swiper-wrapper';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { Route, RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import interactionPlugin from '@fullcalendar/interaction';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TasksComponent } from './tasks.component';
import { BoardsComponent } from './boards/boards.component';
import { TasksListViewComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { TasksKanbanComponent } from './kanban/kanban.component';
import { TaskDetailsComponent } from './details/details.component';
import { BoardCardDetailsResolver, BoardDetailsResolver, BoardListResolver, CardTimeTracksResolver, TasksResolver } from './tasks.resovers';
import { ArchivedComponent } from '../../../crm/pipeline/archived/archived.component';
import { ArchivedResolver } from '../../../crm/pipeline/archived/archived.resovers';
import { NgxFileDropModule } from 'ngx-file-drop';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

export const routes: Route[] = [
  {
    path: '',
    component: TasksComponent,
    children: [
      {
        path: 'all',
        component: BoardsComponent,
        resolve: {
          boards: TasksResolver,
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
        path: 'board/:id',
        component: TasksKanbanComponent,
        resolve: {
          board: BoardDetailsResolver,
        },
      },
      {
        path: 'list/:id',
        component: TasksListViewComponent,
        resolve: {
          board: BoardListResolver,
        },
      },
      {
        path: 'card/:id',
        component: TaskDetailsComponent,
        resolve: {
          card: BoardCardDetailsResolver,
          // comments: CardCommentsResolver,
          times: CardTimeTracksResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [TasksComponent, BoardsComponent, TasksKanbanComponent, TasksListViewComponent, TaskDetailsComponent],
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
    NgxFileDropModule,
    TranslateModule,
    DragDropModule,
    MatTableModule,
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
    MatProgressSpinnerModule,
    FlatpickrModule.forRoot(),
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TasksModule {}
