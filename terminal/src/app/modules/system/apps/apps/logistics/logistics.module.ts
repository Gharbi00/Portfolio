import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { logisticsRoutes } from './logistics.routing';
import { LogisticsComponent } from './logistics.component';
import { TranslateModule } from '@ngx-translate/core';
import { LogisticCompaniesResolver, LogisticsResolver } from './logistics.resolvers';
import { LogisticsService } from './logistics.service';

@NgModule({
  providers: [LogisticsService, LogisticsResolver, LogisticCompaniesResolver],
  declarations: [LogisticsComponent],
  imports: [
    RouterModule.forChild(logisticsRoutes),
    FormsModule,
    NgbNavModule,
    CommonModule,
    NgSelectModule,
    TranslateModule,
    MatTooltipModule,
    ColorPickerModule,
    ReactiveFormsModule,
  ],
})
export class LogisticsModule {}
