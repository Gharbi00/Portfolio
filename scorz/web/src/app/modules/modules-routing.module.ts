import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../shared/layout/main-layout/main-layout.component';
import { IndexComponent } from './home/home.component';
import { Error404Component } from './pages/error404/error404.component';
import { InitialDataResolver } from '../app.resolvers';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyPolicyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { CookiePolicyComponent } from './pages/cookie/cookie.component';
import { BetComponent } from './bet/bet.component';
import { AboutComponent } from './pages/about/about.component';
import { FaqComponent } from './pages/faq/faq.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { PromotionComponent } from './promotion/promotion.component';
import { AffiliateComponent } from './affiliate/affiliate.component';
import { BetHistoryComponent } from './bet-history/bet-history.component';
import { DashboardComponent } from './dashborad/dashborad.component';
import { DepositComponent } from './deposit/deposit.component';
import { PromoDetailsComponent } from './promo-details/promo-details.component';
import { RankingComponent } from './ranking/ranking.component';
import { RefferalComponent } from './refferal/refferal.component';
import { SettingComponent } from './setting/setting.component';
import { TransactionComponent } from './transaction/transaction.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
const modulesRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      { path: '', component: IndexComponent },
      { path: 'bet', component: BetComponent },
      { path: 'promotion', component: PromotionComponent },
      { path: 'bet-history', component: BetHistoryComponent },
      { path: 'affiliate', component: AffiliateComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'deposit', component: DepositComponent },
      { path: 'promo-details', component: PromoDetailsComponent },
      { path: 'setting', component: SettingComponent },
      { path: 'transaction', component: TransactionComponent },
      { path: 'ranking', component: RankingComponent },
      { path: 'withdraw', component: WithdrawComponent },
      { path: 'referral', component: RefferalComponent },
      { path: 'match-details', component: MatchDetailsComponent },
      { path: 'blog', loadChildren: () => import('./blog/blog.module').then((m) => m.BlogModule) },
      { path: 'auth', loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule) },
      { path: 'about-us', component: AboutComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'privacy', component: PrivacyPolicyComponent },
      { path: 'cookies', component: CookiePolicyComponent },
      { path: 'contact', component: ContactComponent },
    ],
  },
  { path: '404', component: Error404Component },
];

@NgModule({
  declarations: [Error404Component, PrivacyPolicyComponent, TermsComponent, CookiePolicyComponent],
  imports: [CommonModule, RouterModule.forChild(modulesRoutes)],
  exports: [RouterModule],
})
export class ModulesRoutingModule {}
