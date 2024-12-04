import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyComponent } from './company/company.component';
import { SettingsComponent } from './settings/settings.component';
import { LogisticCompaniesResolver, PriceListResolver, SettingsResolver, TaxResolver } from './settings/settings.resovers';

const routes: Routes = [
  {
    path: 'team',
    loadChildren: () => import('./team/team.module').then((m) => m.TeamModule),
  },
  {
    path: 'company',
    component: CompanyComponent,
  },
  {
    path: 'permissions',
    loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
  },
  {
    path: 'settings',
    component: SettingsComponent,
    resolve: {
      tax: TaxResolver,
      settings: SettingsResolver,
      priceList: PriceListResolver,
      logistics: LogisticCompaniesResolver,
    },
  },
  {
    path: 'apps',
    loadChildren: () => import('./apps/apps.module').then((m) => m.IntegrationAppsModule),
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class SystemRoutingModule {}
