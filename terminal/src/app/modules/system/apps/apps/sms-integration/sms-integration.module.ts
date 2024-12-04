import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { smsIntegrationRoutes } from './sms-integration.routing';
import { SmsIntegrationComponent } from './sms-integration.component';
import { SmsIntegrationResolver } from './sms-integration.resolvers';

@NgModule({
  providers: [SmsIntegrationResolver],
  declarations: [SmsIntegrationComponent],
  imports: [
    RouterModule.forChild(smsIntegrationRoutes),
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
export class SmsIntegrationModule {}
