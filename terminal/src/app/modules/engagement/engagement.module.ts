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

import { SharedModule } from '../../shared/shared.module';
import { WidgetModule } from '../../shared/widget/widget.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ArchwizardModule } from 'angular-archwizard';
import { EngagementRoutingModule } from './engagement-routing.module';
import { CommunityModule } from './community/community.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { WalletModule } from './wallet/wallet.module';
import { CampaignModule } from './campaigns/campaign.module';
import { AudienceDetailsResolver, AudiencesResolver } from './audience/audience.resolver';
import { SettingsResolver } from './community/subscribers/subscribers.resolvers';
import { WalletResolver } from './community/wallet/wallets.resolvers';

@NgModule({
  providers: [AudiencesResolver, AudienceDetailsResolver, SettingsResolver, WalletResolver],
  declarations: [],
  imports: [
    EngagementRoutingModule,
    CommonModule,
    FeatherModule.pick(allIcons),
    CountToModule,
    WalletModule,
    CampaignModule,
    NgbToastModule,
    LeafletModule,
    CommunityModule,
    NgbDropdownModule,
    NgbNavModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    SharedModule,
    WidgetModule,
    FormsModule,
    LightboxModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbAccordionModule,
    NgSelectModule,
    NgbRatingModule,
    NgxSliderModule,
    ArchwizardModule,
    NgApexchartsModule,
    Ng2SearchPipeModule,
  ],
})
export class EngagementModule {}
