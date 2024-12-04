import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { ArchwizardModule } from 'angular-archwizard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { campaignsRoutes } from './campaigns.routing';
import { CampaignsComponent } from './campaigns.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { CampaignTypeResolver } from './campaigns.resolvers';

@NgModule({
  providers: [CampaignTypeResolver],
  declarations: [CampaignsComponent],
  imports: [
    RouterModule.forChild(campaignsRoutes),
    FormsModule,
    NgbNavModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    NgSelectModule,
    FlexLayoutModule,
    ArchwizardModule,
    MatTooltipModule,
    ColorPickerModule,
    NgbPaginationModule,
    ReactiveFormsModule,
  ],
})
export class CampaignsModule {}
