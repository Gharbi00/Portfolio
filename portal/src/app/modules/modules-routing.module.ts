import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../shared/layout/main-layout/main-layout.component';
import { IndexComponent } from './home/home.component';

import { LosingCustomersComponent } from './engage/engage.component';

import { CompetitionComponent } from './collect/collect.component';
import { MonetizeCommunityComponent } from './monetize/monetize.component';
import { GrowRevenueComponent } from './grow/grow.component';
import { Error404Component } from './pages/error404/error404.component';
import { InitialDataResolver } from '../app.resolvers';

const ModulesRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      { path: '', component: IndexComponent },
      { path: 'engage', component: LosingCustomersComponent },
      { path: 'collect', component: CompetitionComponent },
      { path: 'grow', component: GrowRevenueComponent },
      { path: 'monetize', component: MonetizeCommunityComponent },
      { path: 'blog', loadChildren: () => import('./blog/blog.module').then((m) => m.BlogModule) },
      { path: '', loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule) },
    ],
  },
  { path: '404', component: Error404Component },
];

@NgModule({
  declarations: [],

  imports: [CommonModule, RouterModule.forChild(ModulesRoutes)],
  exports: [RouterModule],
})
export class ModulesRoutingModule {}
