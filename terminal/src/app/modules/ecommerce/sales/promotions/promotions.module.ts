import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { PromotionsComponent } from './promotions.component';
import { PromotionsListComponent } from './list/list.component';
import { PromotionComponent } from './details/details.component';
import { PromotionResolver, PromotionsBarcodesResolver, PromotionsResolver } from './promotions.resolvers';

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

export const promotionsRoutes: Route[] = [
  {
    path: '',
    component: PromotionsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PromotionsListComponent,
        resolve: {
          promotions: PromotionsResolver,
        },
      },
      {
        path: 'new-promotion',
        component: PromotionComponent,
        resolve: {
          barcodes: PromotionsBarcodesResolver,
        },
      },
      {
        path: ':id',
        component: PromotionComponent,
        resolve: {
          coupons: PromotionResolver,
          barcodes: PromotionsBarcodesResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [PromotionsComponent, PromotionsListComponent, PromotionComponent],
  imports: [
    RouterModule.forChild(promotionsRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    NgbRatingModule,
    TranslateModule,
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
    PromotionsResolver,
    PromotionsBarcodesResolver,
    PromotionResolver,
    DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PromotionsModule {}
