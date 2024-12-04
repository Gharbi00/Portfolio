import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { ecommerceRoutes } from './ecommerce.routing';
import { EcommerceComponent } from './ecommerce.component';
import { EditZonesModule } from './edit-zones/edit-zones.module';
import { SharedModule } from '../../../../../../app/shared/shared.module';
import { EcommerceSettingsResolver, EmailsResolver } from './ecommerce.resolvers';
import { SmsIntegrationResolver } from '../website/website.resolvers';

@NgModule({
  providers: [EcommerceSettingsResolver, EmailsResolver, SmsIntegrationResolver],
  declarations: [EcommerceComponent],
  imports: [
    RouterModule.forChild(ecommerceRoutes),
    FormsModule,
    NgbNavModule,
    CommonModule,
    SharedModule,
    NgSelectModule,
    NgbModalModule,
    TranslateModule,
    EditZonesModule,
    MatTooltipModule,
    ColorPickerModule,
    ReactiveFormsModule,
    NgxMatTimepickerModule,
  ],
})
export class EcommerceModule {}
