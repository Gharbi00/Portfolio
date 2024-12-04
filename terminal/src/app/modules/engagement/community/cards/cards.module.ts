import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { CardResolver } from './cards.resolvers';
import { CardsComponent } from './cards.component';
import { CardsListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';

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

export const notificationsRoutes: Route[] = [
  {
    path: '',
    component: CardsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CardsListComponent,
        resolve: {
          notifications: CardResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    CardResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  declarations: [CardsListComponent, CardsComponent],
  imports: [
    RouterModule.forChild(notificationsRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    QRCodeModule,
    NgSelectModule,
    NgbModalModule,
    FlatpickrModule,
    TranslateModule,
    NgbTooltipModule,
    NgxBarcodeModule,
    MatTooltipModule,
    MatTooltipModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgxMatTimepickerModule,
    SimplebarAngularModule,
    FeatherModule.pick(allIcons),
  ],
})
export class CardsModule {}
