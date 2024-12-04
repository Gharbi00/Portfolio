import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CountToModule } from 'angular-count-to';
import { TranslocoModule } from '@ngneat/transloco';
import { Route, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RequestDetailsResolver, RequestsResolver } from './requests.resolvers';
import {
  NgbNavModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbTypeaheadModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { HelpersModule } from '@diktup/frontend/helpers';

import { RequestsComponent } from './requests.component';
import { RequestListComponent } from './list/list.component';
import { SharedModule } from '../../../shared/shared.module';
import { RequestDetailsComponent } from './details/details.component';
import { NgSelectModule } from '@ng-select/ng-select';

export const requestsRoutes: Route[] = [
  {
    path: '',
    component: RequestsComponent,
    children: [
      {
        path: '',
        component: RequestListComponent,
        resolve: {
          requests: RequestsResolver,
        },
      },
      {
        path: ':id',
        component: RequestDetailsComponent,
        resolve: {
          request: RequestDetailsResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [RequestsResolver, RequestDetailsResolver, DatePipe],
  declarations: [RequestsComponent, RequestListComponent, RequestDetailsComponent],
  imports: [
    RouterModule.forChild(requestsRoutes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    TranslateModule,
    SharedModule,
    NgSelectModule,
    CountToModule,
    HelpersModule,
    NgbNavModule,
    NgbRatingModule,
    NgbTooltipModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgbTypeaheadModule,
    NgbPaginationModule,
    NgbProgressbarModule,
  ],
})
export class RequestsModule {}
