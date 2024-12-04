import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { Route, RouterModule } from '@angular/router';
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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { SharedModule } from '../../../../shared/shared.module';
import { LeaderboardListComponent } from './list/list.component';
import { LeaderboardComponent } from './leaderboard.component';
import { LeaderboardResolver } from './leaderboard.resolvers';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsResolver } from '../subscribers/subscribers.resolvers';

const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

export const LeaderboardRoutes: Route[] = [
  {
    path: '',
    component: LeaderboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LeaderboardListComponent,
        resolve: {
          newsletter: LeaderboardResolver,
          settings: SettingsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [LeaderboardComponent, LeaderboardListComponent],
  imports: [
    RouterModule.forChild(LeaderboardRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    NgbRatingModule,
    FlatpickrModule,
    MatTooltipModule,
    NgbTooltipModule,
    TranslateModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbProgressbarModule,
    FeatherModule.pick(allIcons),
  ],
  providers: [
    LeaderboardResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
})
export class LeaderboardModule {}
