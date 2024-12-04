import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { TranslateModule } from '@ngx-translate/core';

import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SharedModule } from '../../../../shared/shared.module';

import { OpenCartsListComponent } from './list/open-carts-list.component';
import { OpenCartsComponent } from './open-carts.component';
import { OpenCartsResolver } from './open-carts.resolvers';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD MMM YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

export const openCartsRoutes: Route[] = [
  {
    path: '',
    component: OpenCartsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OpenCartsListComponent,
        resolve: {
          openCarts: OpenCartsResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    OpenCartsResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  declarations: [OpenCartsComponent, OpenCartsListComponent],
  imports: [
    SharedModule,
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
    // InstallmentModule,
    // FilterModalModule,
    RouterModule.forChild(openCartsRoutes),
  ],
})
export class OpenCartsModule {}
