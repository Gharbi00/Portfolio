import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { StaticRoutes } from './static.routing';
import { StaticComponent } from './static.component';
import { StaticListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { StaticResolver } from './static.resolvers';

@NgModule({
  providers: [StaticResolver],
  declarations: [StaticComponent, StaticListComponent],
  imports: [
    RouterModule.forChild(StaticRoutes),
    FormsModule,
    CommonModule,
    NgbNavModule,
    SharedModule,
    NgbModalModule,
    NgSelectModule,
    TranslateModule,
    FlatpickrModule,
    NgxSliderModule,
    ArchwizardModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbPaginationModule,
  ],
})
export class StaticModule {}
