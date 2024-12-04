import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsResolver, SubscriberResolver } from './subscribers.resolvers';
import { SubscribersComponent } from './subscribers.component';
import { SharedModule } from '../../../../shared/shared.module';
import { SubscribersListComponent } from './list/list.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

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

export const subscribersRoutes: Route[] = [
  {
    path: '',
    component: SubscribersComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: SubscribersListComponent,
        resolve: {
          subs: SubscriberResolver,
          settings: SettingsResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    SubscriberResolver,
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  declarations: [SubscribersListComponent, SubscribersComponent],
  imports: [
    RouterModule.forChild(subscribersRoutes),
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
export class SubscribersModule {}
