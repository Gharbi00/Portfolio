import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Route, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { ChallengesResolver } from './list/list.resolvers';
import { ChallengeListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ChallengeDetailsComponent } from './details/details.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { AudienceComponent } from './audience/audience.component';
import { WinnersComponent } from './winners/winners.component';
import { SettingsComponent } from './settings/settings.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { QuillModule } from 'ngx-quill';

export const routes: Route[] = [
  {
    path: '',
    component: ChallengeListComponent,
    resolve: {
      challenges: ChallengesResolver,
    },
  },
  {
    path: ':id',
    component: ChallengeDetailsComponent,
    children: [
      {
        path: 'leaderboard',
        component: LeaderboardComponent,
      },
      {
        path: 'activities',
        component: ActivityListComponent,
      },
      {
        path: 'winners',
        component: WinnersComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'audience',
        children: [
          {
            path: '',
            component: AudienceComponent,
          },
        ],
      },
      { path: '', redirectTo: 'leaderboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'leaderboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  providers: [ChallengesResolver],
  declarations: [
    WinnersComponent,
    SettingsComponent,
    AudienceComponent,
    ActivityListComponent,
    ChallengeListComponent,
    LeaderboardComponent,
    ChallengeDetailsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    QuillModule,
    FormsModule,
    NgbNavModule,
    SharedModule,
    CommonModule,
    NgSelectModule,
    FlatpickrModule,
    TranslateModule,
    MatTooltipModule,
    NgbDropdownModule,
    ColorPickerModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    // CampaignsRoutingModule,
  ],
})
export class ChallengesModule {}
