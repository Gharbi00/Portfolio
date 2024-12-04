import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'subscribers',
    loadChildren: () => import('./subscribers/subscribers.module').then((m) => m.SubscribersModule),
  },
  {
    path: 'leaderboard',
    loadChildren: () => import('./leaderboard/leaderboard.module').then((m) => m.LeaderboardModule),
  },
  {
    path: 'cards',
    loadChildren: () => import('./cards/cards.module').then((m) => m.CardsModule),
  },
  {
    path: 'wallets',
    loadChildren: () => import('./wallet/wallets.module').then((m) => m.WalletsModule),
  },
  {
    path: 'referrals',
    loadChildren: () => import('./referrals/referrals.module').then((m) => m.ReferralsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunityRoutingModule {}
