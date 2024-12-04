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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { NewsLetterListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { NewsLetterComponent } from './newsletter.component';
import { NewslettersResolver } from './newsletter.resolvers';
import { NewsletterService } from './newsletter.service';

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

export const newsLetterRoutes: Route[] = [
  {
    path: '',
    component: NewsLetterComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: NewsLetterListComponent,
        resolve: {
          newsletter: NewslettersResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [NewsLetterComponent, NewsLetterListComponent],
  imports: [
    RouterModule.forChild(newsLetterRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    NgbRatingModule,
    FlatpickrModule,
    NgbTooltipModule,
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
    NewsletterService,
    NewslettersResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
})
export class NewsletterModule {}
