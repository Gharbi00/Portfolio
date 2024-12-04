import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateModule } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OrdersComponent } from './orders.component';
import { OrdersListComponent } from './list/list.component';
import { OrdersResolver, ProductOrdersResolver } from './orders.resolvers';
import { OrdersDetailsComponent } from './details/details.component';
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

export const ordersRoutes: Route[] = [
  {
    path: '',
    component: OrdersComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OrdersListComponent,
        resolve: {
          orders: OrdersResolver,
        },
      },
      {
        path: 'add-order',
        component: OrdersDetailsComponent,
        resolve: {
          products: ProductOrdersResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    OrdersResolver,
    ProductOrdersResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  declarations: [OrdersComponent, OrdersListComponent, OrdersDetailsComponent],
  imports: [
    RouterModule.forChild(ordersRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    TranslateModule,
    FlatpickrModule,
    NgbTooltipModule,
    MatTooltipModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    FeatherModule.pick(allIcons),
    AgmCoreModule,
  ],
})
export class OrdersModule {}
