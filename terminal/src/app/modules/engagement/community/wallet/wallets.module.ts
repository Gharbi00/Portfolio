import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { WalletResolver } from './wallets.resolvers';
import { WalletsComponent } from './wallets.component';
import { WalletListComponent } from './list/list.component';
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

export const walletsRoutes: Route[] = [
  {
    path: '',
    component: WalletsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WalletListComponent,
        resolve: {
          wallet: WalletResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    WalletResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  declarations: [WalletsComponent, WalletListComponent],
  imports: [
    RouterModule.forChild(walletsRoutes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    FlatpickrModule,
    NgbTooltipModule,
    MatTooltipModule,
    TranslateModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    SimplebarAngularModule,
    FeatherModule.pick(allIcons),
  ],
})
export class WalletsModule {}
