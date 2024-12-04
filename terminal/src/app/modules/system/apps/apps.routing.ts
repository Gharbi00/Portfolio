import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppsResolver } from './apps.resolvers';
import { AppsListComponent } from './list/list.component';

const routes: Routes = [
  {
    path: '',
    component: AppsListComponent,
    resolve: {
      team: AppsResolver,
    },
  },
  {
    path: 'google-tags',
    loadChildren: () => import('./apps/google/google.module').then((m) => m.GoogleModule),
  },
  {
    path: 'integrator',
    loadChildren: () => import('./apps/integrator/integrator.module').then((m) => m.IntegratorModule),
  },
  {
    path: 'meta-pixel',
    loadChildren: () => import('./apps/meta/pixel/pixel.module').then((m) => m.PixelModule),
  },
  {
    path: 'meta-catalog',
    loadChildren: () => import('./apps/meta/catalog/catalog.module').then((m) => m.MetaCatalogModule),
  },
  {
    path: 'loyalty',
    loadChildren: () => import('./apps/loyalty/loyalty.module').then((m) => m.LoyaltyModule),
  },
  {
    path: 'website',
    loadChildren: () => import('./apps/website/website.module').then((m) => m.WebsiteModule),
  },
  {
    path: 'campaigns',
    loadChildren: () => import('./apps/campaigns/campaigns.module').then((m) => m.CampaignsModule),
  },
  {
    path: 'sales',
    loadChildren: () => import('./apps/sales/sales.module').then((m) => m.SalesModule),
  },
  {
    path: 'widget',
    loadChildren: () => import('./apps/widget/widget.module').then((m) => m.WidgetModule),
  },
  {
    path: 'ecommerce',
    loadChildren: () => import('./apps/ecommerce/ecommerce.module').then((m) => m.EcommerceModule),
  },
  {
    path: 'purchase',
    loadChildren: () => import('./apps/purchase/purchase.module').then((m) => m.PurchaseModule),
  },
  {
    path: 'helpdesk',
    loadChildren: () => import('./apps/helpdesk/helpdesk.module').then((m) => m.HelpdeskModule),
  },
  {
    path: 'inventory',
    loadChildren: () => import('./apps/inventory/inventory.module').then((m) => m.InventoryModule),
  },
  {
    path: 'invoicing',
    loadChildren: () => import('./apps/invoicing/invoicing.module').then((m) => m.InvoicingModule),
  },
  {
    path: 'logistics',
    loadChildren: () => import('./apps/logistics/logistics.module').then((m) => m.LogisticsModule),
  },
  {
    path: 'integration',
    loadChildren: () => import('./apps/integration/integration.module').then((m) => m.IntegrationModule),
  },
  {
    path: 'sms',
    loadChildren: () => import('./apps/sms-integration/sms-integration.module').then((m) => m.SmsIntegrationModule),
  },
  {
    path: 'email',
    loadChildren: () => import('./apps/email-integration/email-integration.module').then((m) => m.EmailIntegrationModule),
  },
  {
    path: 'notification',
    loadChildren: () => import('./apps/notifications-integration/notifications-integration.module').then((m) => m.NotificationIntegrationModule),
  },
  {
    path: 'kyc',
    loadChildren: () => import('./apps/kyc/kyc.module').then((m) => m.KycModule),
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class AppsRoutingModule {}
