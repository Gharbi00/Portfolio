import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { HelpersModule } from '@diktup/frontend/helpers';

import { SharedModule } from '../../../../shared/shared.module';
import { ProductGroupResolver } from './product-group.resovers';
import { ProductGroupListComponent } from './list/list.component';
import { ProductGroupComponent } from './product-group.component';

export const productGroupRoutes: Route[] = [
  {
    path: '',
    component: ProductGroupComponent,
    children: [
      {
        path: '',
        component: ProductGroupListComponent,
        resolve: {
          settings: ProductGroupResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [ProductGroupComponent, ProductGroupListComponent],
  imports: [
    RouterModule.forChild(productGroupRoutes),
    FormsModule,
    SharedModule,
    NgbNavModule,
    CommonModule,
    HelpersModule,
    NgSelectModule,
    TranslateModule,
    FlatpickrModule,
    NgbTooltipModule,
    FlexLayoutModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    FeatherModule.pick(allIcons),
  ],
  providers: [ProductGroupResolver, DatePipe],
})
export class ProductGroupModule {}
