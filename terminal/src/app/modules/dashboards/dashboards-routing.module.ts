import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrmComponent } from './crm/crm.component';
import { SalesDashboardComponent } from './sales/sales.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { EcommerceDashboardComponent } from './ecommerce/ecommerce.component';
import { CollaborationDashboardComponent } from './collaboration/collaboration.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsComponent,
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    resolve: {
      // stats: AnalyticsStatsResolver,
      // usersCountries: AnalyticsUsersCountriesResolver,
      // sessions: AnalyticsSessionsByCountriesResolver,
      // metrics: AnalyticsAudienceMetricsResolver,
      // sessionsByCountry: AnalyticsSessionByCountryResolver,
      // usersByDevice: AnalyticsUsersByDeviceResolver,
      // topOs: AnalyticsTopOperatingSystemsResolver,
      // topPages: AnalyticsTopPagesResolver
    },
  },

  {
    path: 'crm',
    component: CrmComponent,
    resolve: {
      // stats: CrmAnalyticsStatsResolver,
      // salesForecast: CrmAnalyticsSalesForecastResolver,
      // dealType: CrmAnalyticsDealTypeResolver,
      // balance: CrmAnalyticsBalanceOverviewResolver
    },
  },
  {
    path: 'sales',
    component: SalesDashboardComponent,
  },
  {
    path: 'collaboration',
    component: CollaborationDashboardComponent,
  },
  {
    path: 'ecommerce',
    component: EcommerceDashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardsRoutingModule {}
