import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EmailIntegrationComponent } from './email-integration.component';
import { TranslateModule } from '@ngx-translate/core';
import { emailIntegrationRoutes } from './email-integration.routing';
import { EmailIntegrationResolver } from './email-integration.resolvers';

@NgModule({
  providers: [EmailIntegrationResolver],
  declarations: [EmailIntegrationComponent],
  imports: [
    RouterModule.forChild(emailIntegrationRoutes),
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
export class EmailIntegrationModule {}
