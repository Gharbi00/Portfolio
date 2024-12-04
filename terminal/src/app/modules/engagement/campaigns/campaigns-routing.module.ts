import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'buttons',
    loadChildren: () => import('./buttons/buttons.module').then((m) => m.ButtonsModule),
  },
  {
    path: 'challenges',
    loadChildren: () => import('./challenges/challenges.module').then((m) => m.ChallengesModule),
  },
  {
    path: 'campaigns',
    loadChildren: () => import('./campaign/campaigns.module').then((m) => m.MainCampaignsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignsRoutingModule {}
