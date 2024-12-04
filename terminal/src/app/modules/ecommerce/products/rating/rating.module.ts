import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';

import { ReviewsListComponent } from './list/list.component';
import { RatingComponent } from './rating.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CorporateRatingAssignmentsResolver, RatingsResolver } from './rating.resolvers';

export const ratingsRoutes: Route[] = [
  {
    path: '',
    component: RatingComponent,
    children: [
      {
        path: '',
        component: ReviewsListComponent,
        resolve: {
          ratingDefinitions: RatingsResolver,
          CorporateRatingAssignments: CorporateRatingAssignmentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [RatingComponent, ReviewsListComponent],
  imports: [
    RouterModule.forChild(ratingsRoutes),
    CommonModule,
    SharedModule,
    FeatherModule.pick(allIcons),
    TranslateModule,
    NgbDropdownModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    FlatpickrModule,
    NgSelectModule,
    NgbPaginationModule,
    NgbNavModule,
  ],
  providers: [
    RatingsResolver,
    CorporateRatingAssignmentsResolver,
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: moment.ISO_8601,
        },
        display: {
          dateInput: 'll',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
export class RatingModule {}
