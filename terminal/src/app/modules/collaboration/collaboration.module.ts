import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
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
import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
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

import { SortByPipe } from './sort-by.pipe';
import { SharedModule } from '../../shared/shared.module';
import { MailboxComponent } from './mailbox/mailbox.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ProjectsModule } from './projects/projects/projects.module';
import { CollaborationRoutingModule } from './collaboration-routing.module';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { TranslateModule } from '@ngx-translate/core';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
};

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [SortByPipe, MailboxComponent, CalendarComponent, FileManagerComponent],
  providers: [
    DatePipe,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
  imports: [
    TranslateModule,
    CollaborationRoutingModule,
    DndModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    ProjectsModule,
    NgSelectModule,
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
    NgApexchartsModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
  ],
})
export class CollaborationModule {}
