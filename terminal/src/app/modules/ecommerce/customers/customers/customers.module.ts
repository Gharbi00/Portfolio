import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SharedModule } from '../../../../shared/shared.module';

import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomersComponent } from './customers.component';
import { CustomersListComponent } from './list/list.component';
import { CustomersResolver, UserResolver } from './customers.resolvers';
import { CustomersDetailsComponent } from './details/details.component';
import { AgmCoreModule } from '@agm/core';

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

export const customersRoutes: Route[] = [
  {
    path: '',
    component: CustomersComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CustomersListComponent,
        resolve: {
          customers: CustomersResolver,
        },
      },
      {
        path: ':id',
        component: CustomersDetailsComponent,
        resolve: {
          user: UserResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    CustomersResolver,
    UserResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  declarations: [CustomersComponent, CustomersListComponent, CustomersDetailsComponent],
  imports: [
    FormsModule,
    SharedModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    AgmCoreModule,
    NgSelectModule,
    TranslateModule,
    FlatpickrModule,
    NgbTooltipModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    FeatherModule.pick(allIcons),
    RouterModule.forChild(customersRoutes),
  ],
})
export class CustomersModule {}
