import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { NgxFileDropModule } from 'ngx-file-drop';
import { YouTubePlayerModule } from '@angular/youtube-player';
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
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { CampaignsComponent } from './campaigns.component';
import { CampaignsListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { OverviewComponent } from './overview/overview.component';
import { CommentsModule } from '../../../../shared/components/comments/comments.module';
import { CompaignDetailsResolver, CompaignResolver } from './campaigns.resolver';
import { CompaignDetailsComponent } from './details/details.component';
import { BudgetComponent } from './budget/budget.component';
import { AudienceComponent } from './audience/audience.component';
import { SettingsComponent } from './settings/settings.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RemunerationComponent } from './remuneration/remuneration.component';
import { QuillModule } from 'ngx-quill';
import { CampaignComponent } from './campaign/campaign.component';
import { QRCodeModule } from 'angularx-qrcode';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

export const routes: Route[] = [
  {
    path: '',
    component: CampaignsListComponent,
    resolve: {
      campaigns: CompaignResolver,
    },
  },
  {
    path: ':id',
    component: CompaignDetailsComponent,
    children: [
      {
        path: 'overview',
        component: OverviewComponent,
      },
      {
        path: 'campaign',
        component: CampaignComponent,
      },
      {
        path: 'budget',
        component: BudgetComponent,
      },
      {
        path: 'remuneration',
        component: RemunerationComponent,
      },
      {
        path: 'audience',
        children: [
          {
            path: '',
            component: AudienceComponent,
          },
          {
            path: ':audienceId',
            // component: AudienceModalComponent,
          },
        ],
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  providers: [CompaignResolver, CompaignDetailsResolver, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    CampaignComponent,
    CampaignsComponent,
    CampaignsListComponent,
    CompaignDetailsComponent,
    OverviewComponent,
    CampaignsComponent,
    BudgetComponent,
    AudienceComponent,
    SettingsComponent,
    RemunerationComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    DndModule,
    QuillModule,
    FormsModule,
    CommonModule,
    QRCodeModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    NgbRatingModule,
    CountToModule,
    CommentsModule,
    YouTubePlayerModule,
    LeafletModule,
    NgxFileDropModule,
    NgApexchartsModule,
    MatTooltipModule,
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
export class MainCampaignsModule {}
