import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { DashboardResolver } from './index/index.resolvers';
import { FaqsComponent } from '../pages/faqs/faqs.component';
import { SearchResultsComponent } from '../pages/search-results/search-results.component';
import { LayoutComponent } from '../layouts/layout.component';
import { UserResolver } from '../shared/resolvers/user.resolver';
import { ProfileResolver } from './website/profile/business-profile.resolvers';
import { Error404Component } from '../pages/errors/404/404.component';
import { AuthGuard } from '../core/auth/guards/auth.guard';
import { LoginComponent } from '../account/auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    resolve: { currentUser: UserResolver, pos: ProfileResolver },
    children: [
      {
        path: '',
        component: IndexComponent,
        resolve: {
          dashboard: DashboardResolver,
        },
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboards/dashboards.module').then((m) => m.DashboardsModule),
      },
      {
        path: 'inventory',
        loadChildren: () => import('./inventory/inventory.module').then((m) => m.InventoryModule),
      },
      {
        path: 'website',
        loadChildren: () => import('./website/website.module').then((m) => m.WebsiteModule),
      },
      {
        path: 'ecommerce',
        loadChildren: () => import('./ecommerce/ecommerce.module').then((m) => m.EcommerceModule),
      },
      {
        path: 'engagement',
        loadChildren: () => import('./engagement/engagement.module').then((m) => m.EngagementModule),
      },
      {
        path: 'hr',
        loadChildren: () => import('./hr/hr.module').then((m) => m.HRModule),
      },
      {
        path: 'system',
        loadChildren: () => import('./system/system.module').then((m) => m.SystemModule),
      },
      {
        path: 'faq',
        component: FaqsComponent,
      },
      {
        path: 'search',
        component: SearchResultsComponent,
      },
    ],
  },
  {
    path: 'fp/:token',
    component: LoginComponent,
  },
  {
    path: '404',
    component: Error404Component,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class ModulesRoutingModule {}
