import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexComponent } from './home/home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ModulesRoutingModule } from './modules-routing.module';
import { CountUpModule } from 'ngx-countup';
import { AndroidComponent } from './docs/android/android.component';
import { LayoutModule } from '../shared/layout/layout.module';
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
import { PushApiComponent } from './docs/push-api/push-api.component';
import { DeductApiComponent } from './docs/deduct-api/deduct-api.component';
import { OverviewComponent } from './docs/overview/overview.component';
import { LogoutApiComponent } from './docs/player-logout/logout.component';
import { WidgetSetupComponent } from './docs/widget-setup/widget-setup.component';
import { OutboundLastComponent } from './docs/outbound/last/last.component';
import { OutboundReadComponent } from './docs/outbound/read/read.component';

@NgModule({
  declarations: [
    IndexComponent,
    LogoutApiComponent,
    AndroidComponent,
    AuthenticationComponent,
    WidgetSetupComponent,
    CardsComponent,
    OverviewComponent,
    OutboundLastComponent,
    OutboundReadComponent,
    CashbackComponent,
    PlayerLoginComponent,
    CheckApiComponent,
    PushApiComponent,
    DeductApiComponent,
    DartComponent,
    EmailServiceComponent,
    FlutterComponent,
    GradleComponent,
    IosComponent,
    LevelsComponent,
    MagentoComponent,
    MobileComponent,
    NewsComponent,
    NpmComponent,
    PrestashopComponent,
    PushNotificationsComponent,
    ReactNativeComponent,
    ShopifyComponent,
    SmsServiceComponent,
    SystemComponent,
    WalletsComponent,
    WebComponent,
    WixComponent,
    WordpressComponent
  ],
  imports: [CommonModule, CarouselModule, ModulesRoutingModule, CountUpModule, LayoutModule],
  exports: [],
})
export class ModulesModule {}
