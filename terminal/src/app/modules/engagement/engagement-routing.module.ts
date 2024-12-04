import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'community',
    loadChildren: () => import('./community/community.module').then((m) => m.CommunityModule),
  },
  {
    path: 'campaigns',
    loadChildren: () => import('./campaigns/campaign.module').then((m) => m.CampaignModule),
  },
  {
    path: 'audiences',
    loadChildren: () => import('./audience/audience.module').then((m) => m.AudiencesModule),
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then((m) => m.WalletModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EngagementRoutingModule {}
