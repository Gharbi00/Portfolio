import { NgxMaskModule } from 'ngx-mask';
import { LightboxModule } from 'ngx-lightbox';
import { NgxBarcodeModule } from 'ngx-barcode';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { SimplebarAngularModule } from 'simplebar-angular';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbNavModule,
  NgbToastModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbTypeaheadModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';

import { routes } from './modules-routing.module';
import { ToastsContainerComponent } from '../shared/components/toasts-container.component';
import { CreateInvoicingComponent } from './shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from './shared/detail-invoicing/detail-invoicing.component';
import { InvoicingDetailPageComponent } from './shared/detail-page-invoicing/detail-page-invoicing.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { CustomCurrencyPipe } from '../shared/pipes/currency.pipe';
import { LayoutsModule } from '../layouts/layouts.module';
import { RouterModule } from '@angular/router';
import { FaqsComponent } from '../pages/faqs/faqs.component';
import { Error404Component } from '../pages/errors/404/404.component';
import { SearchResultsComponent } from '../pages/search-results/search-results.component';
// import { TerminalGeneratorModule } from '@sifca-monorepo/terminal-generator';
// import { AuthModule } from '../core/auth/auth.module';
import { IndexComponent } from './index/index.component';
import { IndexService } from './index/index.service';
import { DashboardResolver } from './index/index.resolvers';
import { ProfileResolver } from './website/profile/business-profile.resolvers';
import { UserResolver } from '../shared/resolvers/user.resolver';
import { TopBarService } from '../layouts/topbar/topbar.service';
import { CustomersService } from './ecommerce/customers/customers/customers.service';
import { LoyaltyService } from './system/apps/apps/loyalty/loyalty.service';
import { TeamService } from './system/team/team.service';
import { ProductsService } from './inventory/products/products/products.service';
import { VisualsService } from './website/content/visuals/visuals.service';
import { SmsIntegrationService } from './system/apps/apps/sms-integration/sms-integration.service';
import { EmailIntegrationService } from './system/apps/apps/email-integration/email-integration.service';
import { NotificationIntegrationService } from './system/apps/apps/notifications-integration/notifications-integration.service';
import { AudiencesService } from './engagement/audience/audience.service';
import { EcommerceService } from './system/apps/apps/ecommerce/ecommerce.service';
import { TranslationResolver } from './website/content/slides/slides.resolvers';
import { WebsiteService } from './system/apps/apps/website/website.service';
import { JobPositionsService } from './hr/career/positions/positions.service';
import { ProductsResolver } from './inventory/products/products/products.resolver';
import {
  AttributesResolver,
  BarcodeDetailsResolver,
  BarcodeResolver,
  BarcodesResolver,
  BarcodesWithStockResolver,
  PriceListResolver,
  WebsiteResolver,
} from './inventory/products/articles/articles.resolvers';
import { SupplierService } from './purchases/suppliers/suppliers.service';
import { LocationsService } from './hr/company/locations/locations.service';
import { BarcodeService } from './inventory/products/articles/articles.service';
import { ResetApiService } from '../core/services/reset-api.service';
import { BlogService } from './website/blog/blog.service';
import { ChatService } from './ecommerce/customers/chat/chat.service';
import { RolesService } from './system/roles/roles.service';
import { BrandService } from './inventory/brands/brands.service';
import { StockService } from './inventory/stock/stock/stock.service';
import { PagesService } from './website/content/pages/pages.service';
import { OrdersService } from './ecommerce/sales/orders/orders.service';
import { SalesService } from './system/apps/apps/sales/sales.service';
import { CardsService } from './engagement/community/cards/cards.service';
import { SlidesService } from './website/content/slides/slides.service';
import { RatingService } from './ecommerce/products/rating/rating.service';
import { StaticService } from './website/content/static/static.service';
import { WalletService } from './engagement/wallet/wallet.service';
import { WidgetService } from './system/apps/apps/widget/widget.service';
import { CouponsService } from './ecommerce/sales/coupons/coupons.service';
import { ButtonsService } from './engagement/campaigns/buttons/buttons.service';
import { WalletsService } from './engagement/community/wallet/wallets.service';
import { SettingsService } from './system/settings/settings.service';
import { RequestsService } from './website/requests/requests.service';
import { OutboundService } from './ecommerce/customers/outbound/outbound.service';
import { ReferralsService } from './engagement/community/referrals/referrals.service';
import { CampaignsService } from './engagement/campaigns/campaign/campaigns.service';
import { QuestTypeService } from './system/apps/apps/campaigns/campaigns.service';
import { OpenCartsService } from './ecommerce/sales/cart/open-carts.service';
import { WarehouseService } from './inventory/stock/warehouse/warehouse.service';
import { AnalyticsService } from './dashboards/analytics/analytics.service';
import { ChallengesService } from './engagement/campaigns/challenges/challenges.service';
import { PromotionsService } from './ecommerce/sales/promotions/promotions.service';
import { CategoriesService } from './inventory/products/categories/categories.service';
import { AttributesService } from './inventory/products/attributes/attributes.service';
import { IntegrationService } from './system/apps/apps/integration/integration.service';
import { DepartmentsService } from './hr/company/departments/departments.service';
import { SubscribersService } from './engagement/community/subscribers/subscribers.service';
import { LeaderboardService } from './engagement/community/leaderboard/leaderboard.service';
import { ProductGroupService } from './ecommerce/products/groups/product-group.service';
import { CrmAnalyticsService } from './dashboards/crm/crm.service';
import { ApplicationsService } from './hr/career/applications/applications.service';
import { SalesAnalyticsService } from './dashboards/sales/sales.service';
import { IntegrationAppsService } from './system/apps/apps.service';
import { EcommerceAnalyticsService } from './dashboards/ecommerce/ecommerce.service';
import { CollaborationAnalyticsService } from './dashboards/collaboration/collaboration.service';
import { DocumentService } from '../shared/services/document.service';
import { AccountModule } from '../account/account.module';
import { NewsletterService } from './ecommerce/customers/newsletter/newsletter.service';
import { CompanyService } from './system/company/company.service';
import { InvoicingService } from './shared/services/invoicing.service';
import { ClicksService } from './ecommerce/products/clicks/clicks.service';
import { ClicksDetailsResolver } from './ecommerce/products/clicks/clicks.resolvers';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  slidesPerView: 'auto',
  direction: 'horizontal',
};

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ResetApiService,
    IndexService,
    CompanyService,
    InvoicingService,
    DocumentService,
    NewsletterService,
    DashboardResolver,
    ProfileResolver,
    UserResolver,
    TopBarService,
    CustomersService,
    LoyaltyService,
    TeamService,
    ProductsService,
    VisualsService,
    SmsIntegrationService,
    EmailIntegrationService,
    NotificationIntegrationService,
    AudiencesService,
    EcommerceService,
    TranslationResolver,
    ClicksDetailsResolver,
    WebsiteService,
    JobPositionsService,
    ProductsResolver,
    WebsiteResolver,
    PriceListResolver,
    BarcodesResolver,
    BarcodesWithStockResolver,
    BarcodeResolver,
    AttributesResolver,
    BarcodeDetailsResolver,
    SupplierService,
    LocationsService,
    BarcodeService,
    StockService,
    BlogService,
    ChatService,
    RolesService,
    BrandService,
    PagesService,
    OrdersService,
    ClicksService,
    SalesService,
    CardsService,
    SlidesService,
    RatingService,
    StaticService,
    WalletService,
    WidgetService,
    CouponsService,
    ButtonsService,
    WalletsService,
    SettingsService,
    RequestsService,
    OutboundService,
    ReferralsService,
    CampaignsService,
    QuestTypeService,
    OpenCartsService,
    WarehouseService,
    AnalyticsService,
    ChallengesService,
    PromotionsService,
    CategoriesService,
    AttributesService,
    IntegrationService,
    DepartmentsService,
    SubscribersService,
    LeaderboardService,
    ProductGroupService,
    CrmAnalyticsService,
    ApplicationsService,
    SalesAnalyticsService,
    IntegrationAppsService,
    EcommerceAnalyticsService,
    CollaborationAnalyticsService,
    DatePipe,
    { provide: SWIPER_CONFIG, useValue: DEFAULT_SWIPER_CONFIG },
    CustomCurrencyPipe,
  ],
  declarations: [
    IndexComponent,
    CreateInvoicingComponent,
    ToastsContainerComponent,
    InvoicingDetailsComponent,
    InvoicingDetailPageComponent,
    SearchResultsComponent,
    FaqsComponent,
    Error404Component,
  ],
  imports: [
    AccountModule,
    LayoutsModule,
    RouterModule.forChild(routes),
    FormsModule,
    CommonModule,
    NgbNavModule,
    PickerModule,
    CountToModule,
    NgxMaskModule,
    FeatherModule,
    MatIconModule,
    LeafletModule,
    LightboxModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    NgbToastModule,
    NgbRatingModule,
    NgxSliderModule,
    MatButtonModule,
    MatDialogModule,
    TranslateModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgbTooltipModule,
    NgxBarcodeModule,
    NgbDropdownModule,
    FullCalendarModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    SimplebarAngularModule,
    NgxUsefulSwiperModule,
  ],
})
export class ModulesModule {}
