import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountToModule } from 'angular-count-to';
import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ArchwizardModule } from 'angular-archwizard';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SharedModule } from '../../../shared/shared.module';
import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CompaignResolver } from './campaign/campaigns.resolver';

@NgModule({
  declarations: [],
  providers:[CompaignResolver],
  imports: [
    FormsModule,
    CommonModule,
    NgbNavModule,
    SharedModule,
    CountToModule,
    LeafletModule,
    NgbToastModule,
    LightboxModule,
    NgSelectModule,
    NgbRatingModule,
    NgxSliderModule,
    NgbTooltipModule,
    ArchwizardModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    CampaignsRoutingModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    FeatherModule.pick(allIcons),
  ],
})
export class CampaignModule {}
