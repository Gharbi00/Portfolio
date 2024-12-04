import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './home/home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ModulesRoutingModule } from './modules-routing.module';
import { CountUpModule } from 'ngx-countup';
import { LayoutModule } from '../shared/layout/layout.module';
import { AppService, LandingPagesService, PosService, SeoService, SlidesService, VisualsService } from '@sifca-monorepo/clients';
import { EcommerceGeneratorModule } from '@sifca-monorepo/ecommerce-generator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BetComponent } from './bet/bet.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { AboutComponent } from './pages/about/about.component';
import { FaqComponent } from './pages/faq/faq.component';
import { BlogModule } from './blog/blog.module';
import { ContactComponent } from './pages/contact/contact.component';
import { TranslateModule } from '@ngx-translate/core';
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
import { ProgressBarDirective } from '../shared/layout/progress-bar.directive';

@NgModule({
  providers: [
    AppService,
    PosService,
    SeoService, 
    SlidesService,
    VisualsService,
    LandingPagesService
    ],
  declarations: [
    IndexComponent,
    MatchDetailsComponent,
    BetComponent,
    AboutComponent,
    FaqComponent,
    ContactComponent,
    PromotionComponent,
    AffiliateComponent,
    BetHistoryComponent,
    DashboardComponent,
    DepositComponent,
    PromoDetailsComponent,
    RankingComponent,
    RefferalComponent,
    SettingComponent,
    TransactionComponent,
    WithdrawComponent,
    ProgressBarDirective
    ],
  imports: [
    EcommerceGeneratorModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    CommonModule,
    CarouselModule,
    ModulesRoutingModule,
    CountUpModule,
    BlogModule,
    TranslateModule
  ],
  exports: [],
})
export class ModulesModule {}
