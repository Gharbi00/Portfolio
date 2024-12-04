import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { Route, RouterModule } from '@angular/router';
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
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EmailTemplatesResolver, OutboundDetailsResolver, OutboundResolver } from './outbound.resolvers';
import { OutboundComponent } from './outbound.component';
import { OutboundListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { OutboundDetailsComponent } from './details/details.component';
import { MatTooltipModule } from '@angular/material/tooltip';

export const outboundRoutes: Route[] = [
  {
    path: '',
    component: OutboundComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OutboundListComponent,
        resolve: {
          outbounds: OutboundResolver,
        },
      },
      {
        path: ':id',
        component: OutboundDetailsComponent,
        resolve: {
          outbound: OutboundDetailsResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [OutboundComponent, OutboundListComponent, OutboundDetailsComponent],
  imports: [
    RouterModule.forChild(outboundRoutes),
    FormsModule,
    QuillModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    NgbRatingModule,
    FlatpickrModule,
    TranslateModule,
    MatTooltipModule,
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
  providers: [OutboundResolver, OutboundDetailsResolver, EmailTemplatesResolver],
})
export class OutboundModule {}
