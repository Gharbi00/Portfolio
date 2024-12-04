import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { integrationRoutes } from './integration.routing';
import { IntegrationComponent } from './integration.component';
import { TranslateModule } from '@ngx-translate/core';
import { IntegrationResolver } from './integration.resolvers';

@NgModule({
  providers: [IntegrationResolver],
  declarations: [IntegrationComponent],
  imports: [
    RouterModule.forChild(integrationRoutes),
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
export class IntegrationModule {}
