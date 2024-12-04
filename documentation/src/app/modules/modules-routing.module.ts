import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../shared/layout/main-layout/main-layout.component';
import { IndexComponent } from './home/home.component';
import { AndroidComponent } from './docs/android/android.component';
import { AuthenticationComponent } from './docs/authentication/authentication.component';
import { CardsComponent } from './docs/cards/cards.component';
import { CashbackComponent } from './docs/cashback/cashback.component';
import { DartComponent } from './docs/dart/dart.component';
import { EmailServiceComponent } from './docs/email-service/email-service.component';
import { FlutterComponent } from './docs/flutter/flutter.component';
import { GradleComponent } from './docs/gradle/gradle.component';
import { IosComponent } from './docs/ios/ios.component';
import { LevelsComponent } from './docs/levels/levels.component';
import { MagentoComponent } from './docs/magento/magento.component';
import { MobileComponent } from './docs/mobile/mobile.component';
import { NewsComponent } from './docs/news/news.component';
import { NpmComponent } from './docs/npm/npm.component';
import { PrestashopComponent } from './docs/prestashop/prestashop.component';
import { PushNotificationsComponent } from './docs/push-notifications/push-notifications.component';
import { ReactNativeComponent } from './docs/react-native/react-native.component';
import { ShopifyComponent } from './docs/shopify/shopify.component';
import { SmsServiceComponent } from './docs/sms-service/sms-service.component';
import { SystemComponent } from './docs/pos-system/pos-system.component';
import { WalletsComponent } from './docs/wallets/wallets.component';
import { WebComponent } from './docs/web/web.component';
import { WixComponent } from './docs/wix/wix.component';
import { WordpressComponent } from './docs/wordpress/wordpress.component';
import { PlayerLoginComponent } from './docs/player-login/player-login.component';
import { CheckApiComponent } from './docs/check-api/check-api.component';
import { DeductApiComponent } from './docs/deduct-api/deduct-api.component';
import { PushApiComponent } from './docs/push-api/push-api.component';
import { OverviewComponent } from './docs/overview/overview.component';
import { LogoutApiComponent } from './docs/player-logout/logout.component';
import { WidgetSetupComponent } from './docs/widget-setup/widget-setup.component';
import { OutboundLastComponent } from './docs/outbound/last/last.component';
import { OutboundReadComponent } from './docs/outbound/read/read.component';

const ModulesRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,

    children: [
      { path: '', redirectTo:'introduction' },
      { path: 'introduction', component: IndexComponent },
      { path: 'android', component: AndroidComponent },
      { path: 'overview', component: OverviewComponent },
      { path: 'authentication', component: AuthenticationComponent },
      { path: 'cards', component: CardsComponent },
      { path: 'cashback', component: CashbackComponent },
      { path: 'player-login', component: PlayerLoginComponent },
      { path: 'check-api', component: CheckApiComponent },
      { path: 'logout-api', component: LogoutApiComponent },
      { path: 'push-api', component: PushApiComponent },
      { path: 'deduct-api', component: DeductApiComponent },
      { path: 'dart', component: DartComponent },
      { path: 'email-service', component: EmailServiceComponent },
      { path: 'flutter', component: FlutterComponent },
      { path: 'widget-setup', component: WidgetSetupComponent },
      { path: 'outbound-last', component: OutboundLastComponent },
      { path: 'outbound-read', component: OutboundReadComponent },
      { path: 'gradle', component: GradleComponent },
      { path: 'ios', component: IosComponent },
      { path: 'levels', component: LevelsComponent },
      { path: 'magento', component: MagentoComponent },
      { path: 'mobile', component: MobileComponent },
      { path: 'news', component: NewsComponent },
      { path: 'npm', component: NpmComponent },
      { path: 'prestashop', component: PrestashopComponent },
      { path: 'push-notifications', component: PushNotificationsComponent },
      { path: 'react-native', component: ReactNativeComponent },
      { path: 'shopify', component: ShopifyComponent },
      { path: 'sms-service', component: SmsServiceComponent },
      { path: 'pos-system', component: SystemComponent },
      { path: 'wallets', component: WalletsComponent },
      { path: 'web', component: WebComponent },
      { path: 'wix', component: WixComponent },
      { path: 'wordpress', component: WordpressComponent },
      { path: '', loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule) },
    ],
  },
];

@NgModule({
  declarations: [],

  imports: [CommonModule, RouterModule.forChild(ModulesRoutes)],
  exports: [RouterModule],
})
export class ModulesRoutingModule {}
