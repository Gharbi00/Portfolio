import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { kycRoutes } from './kyc.routing';
import { TranslateModule } from '@ngx-translate/core';
import { KycService } from './kyc.service';
import { KycComponent } from './kyc.component';
import { KycResolver, PluginResolver } from './kyc.resolvers';

@NgModule({
  providers: [KycService, KycResolver, PluginResolver],
  declarations: [KycComponent],
  imports: [
    RouterModule.forChild(kycRoutes),
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
export class KycModule {}
