import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgbModalModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { salesRoutes } from './sales.routing';
import { SalesComponent } from './sales.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsResolver } from './sales.resolvers';

@NgModule({
  providers: [SettingsResolver],
  declarations: [SalesComponent],
  imports: [
    RouterModule.forChild(salesRoutes),
    FormsModule,
    NgbNavModule,
    CommonModule,
    NgSelectModule,
    NgbModalModule,
    TranslateModule,
    MatTooltipModule,
    ColorPickerModule,
    ReactiveFormsModule,
    NgxMatTimepickerModule,
  ],
})
export class SalesModule {}
