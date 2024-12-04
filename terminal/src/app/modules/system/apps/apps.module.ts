import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMasonryModule } from 'ngx-masonry';
import { TranslateModule } from '@ngx-translate/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import {
  NgbNavModule,
  NgbAlertModule,
  NgbModalModule,
  NgbToastModule,
  NgbPopoverModule,
  NgbTooltipModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { AppsRoutingModule } from './apps.routing';
import { AppsListComponent } from './list/list.component';
import { GoogleModule } from './apps/google/google.module';
import { IntegrationAppComponent } from './apps.component';
import { PixelModule } from './apps/meta/pixel/pixel.module';
import { SharedModule } from '../../../shared/shared.module';
import { IntegratorModule } from './apps/integrator/integrator.module';
import { MetaCatalogModule } from './apps/meta/catalog/catalog.module';
import { EcommerceModule } from './apps/ecommerce/ecommerce.module';
import { SalesModule } from './apps/sales/sales.module';
import { EmailIntegrationModule } from './apps/email-integration/email-integration.module';
import { AppsResolver } from './apps.resolvers';

@NgModule({
  providers: [AppsResolver],
  declarations: [IntegrationAppComponent, AppsListComponent],
  imports: [
    AppsRoutingModule,
    PixelModule,
    FormsModule,
    SalesModule,
    GoogleModule,
    SharedModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgbAlertModule,
    NgbModalModule,
    NgbToastModule,
    EcommerceModule,
    TranslateModule,
    IntegratorModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgxMasonryModule,
    MetaCatalogModule,
    NgbCarouselModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    NgbPaginationModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
    EmailIntegrationModule,
  ],
})
export class IntegrationAppsModule {}
