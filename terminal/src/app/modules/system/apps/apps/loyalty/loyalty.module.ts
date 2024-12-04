import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { loyaltyRoutes } from './loyalty.routing';
import { ColorPickerModule } from 'ngx-color-picker';
import { LoyaltyComponent } from './loyalty.component';
import { NgbNavModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../../../../../../app/shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { LoyaltyDetailsResolver, LoyaltyLevelResolver, LoyaltyResolver } from './loyalty.resolvers';

@NgModule({
  providers: [LoyaltyResolver, LoyaltyDetailsResolver, LoyaltyLevelResolver],
  declarations: [LoyaltyComponent],
  imports: [
    RouterModule.forChild(loyaltyRoutes),
    FormsModule,
    QuillModule,
    NgbNavModule,
    CommonModule,
    NgSelectModule,
    SharedModule,
    TranslateModule,
    MatTooltipModule,
    ColorPickerModule,
    NgbTimepickerModule,
    ReactiveFormsModule,
    NgxMatTimepickerModule,
    FlatpickrModule.forRoot(),
  ],
})
export class LoyaltyModule {}
