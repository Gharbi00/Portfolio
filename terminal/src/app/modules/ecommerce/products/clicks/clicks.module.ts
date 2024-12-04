import moment from 'moment';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountToModule } from 'angular-count-to';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { ClicksComponent } from './clicks.component';
import { ClicksListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ClicksDetailsResolver, ClicksResolver } from './clicks.resolvers';
import { ProductClickDetailComponent } from './detail/detail.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxBarcodeModule } from 'ngx-barcode';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';

export const clicksRoutes: Route[] = [
  {
    path: '',
    component: ClicksComponent,
    children: [
      {
        path: '',
        component: ClicksListComponent,
        resolve: {
          clicks: ClicksResolver,
        },
      },
      {
        path: ':id',
        component: ProductClickDetailComponent,
        resolve: {
          details: ClicksDetailsResolver,

        },
      },
    ],
  },
];

@NgModule({
  declarations: [ClicksComponent, ClicksListComponent, ProductClickDetailComponent],
  imports: [
    RouterModule.forChild(clicksRoutes),
    CommonModule,
    CountToModule,
    SharedModule,
    NgApexchartsModule,
    FeatherModule.pick(allIcons),
    TranslateModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgxBarcodeModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlatpickrModule,
    NgSelectModule,
    MatTooltipModule,
    NgbPaginationModule,
    NgbNavModule,
  ],
  providers: [
    ClicksResolver,
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
export class ClicksModule {}
