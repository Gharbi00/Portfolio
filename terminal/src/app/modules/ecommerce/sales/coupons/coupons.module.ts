import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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

import { CouponsResolver } from './coupons.resolvers';
import { CouponsComponent } from './coupons.component';
import { CouponsListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';

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

export const couponsRoutes: Route[] = [
  {
    path: '',
    component: CouponsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CouponsListComponent,
        resolve: {
          coupons: CouponsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [CouponsComponent, CouponsListComponent],
  imports: [
    RouterModule.forChild(couponsRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    NgbRatingModule,
    FlatpickrModule,
    TranslateModule,
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
    CouponsResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
})
export class CouponsModule {}
