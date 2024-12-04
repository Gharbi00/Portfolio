import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Subscription, combineLatest, forkJoin, of, switchMap, take, map as rxMap, takeUntil, Subject } from 'rxjs';

import { TeamService } from '../../modules/system/team/team.service';
import { BlogService } from '../../modules/website/blog/blog.service';
// import { NotesService } from '../../modules/purchases/note/notes.service';
// import { TicketsService } from '../../modules/crm/tickets/tickets.service';
// import { TodoService } from '../../modules/collaboration/todo/todo.service';
import { BrandService } from '../../modules/inventory/brands/brands.service';
// import { PipelineService } from '../../modules/crm/pipeline/pipeline.service';
// import { SalesOrdersService } from '../../modules/sales/orders/orders.service';
import { IntegrationAppsService } from '../../modules/system/apps/apps.service';
import { StockService } from '../../modules/inventory/stock/stock/stock.service';
import { PagesService } from '../../modules/website/content/pages/pages.service';
import { SettingsService } from '../../modules/system/settings/settings.service';
import { RequestsService } from '../../modules/website/requests/requests.service';
// import { SaleInvoicesService } from '../../modules/sales/invoices/invoices.service';
import { SlidesService } from '../../modules/website/content/slides/slides.service';
import { SupplierService } from '../../modules/purchases/suppliers/suppliers.service';
// import { QuotationsService } from '../../modules/sales/quotations/quotations.service';
// import { PurchasesService } from '../../modules/purchases/purchases/purchases.service';
import { VisualsService } from '../../modules/website/content/visuals/visuals.service';
import { RatingService } from '../../modules/ecommerce/products/rating/rating.service';
import { CouponsService } from '../../modules/ecommerce/sales/coupons/coupons.service';
// import { ContactsService } from '../../modules/crm/customers/contacts/contacts.service';
// import { IssueNotesService } from '../../modules/sales/notes/issue/issue-notes.service';
// import { TasksService } from '../../modules/collaboration/projects/tasks/tasks.service';
import { OpenCartsService } from '../../modules/ecommerce/sales/cart/open-carts.service';
import { LanguageType, LeaderboardCycleEnum, MessageGroupType, PartnershipTypeEnum, PointOfSaleType, ProductClassEnum, TranslationAppEnum } from '@sifca-monorepo/terminal-generator';
import { JobPositionsService } from '../../modules/hr/career/positions/positions.service';
// import { CompaniesService } from '../../modules/crm/customers/companies/companies.service';
import { BarcodeService } from '../../modules/inventory/products/articles/articles.service';
// import { PurchaseInvoicesService } from '../../modules/purchases/invoices/invoices.service';
import { ProductsService } from '../../modules/inventory/products/products/products.service';
import { WarehouseService } from '../../modules/inventory/stock/warehouse/warehouse.service';
import { DepartmentsService } from '../../modules/hr/company/departments/departments.service';
// import { ScheduleService } from '../../modules/inventory/maintenance/schedule/schedule.service';
import { PromotionsService } from '../../modules/ecommerce/sales/promotions/promotions.service';
import { ApplicationsService } from '../../modules/hr/career/applications/applications.service';
// import { DeliveryNotesService } from '../../modules/sales/notes/delivery/delivery-notes.service';
// import { ProjectsService } from '../../modules/collaboration/projects/projects/projects.service';
import { CustomersService } from '../../modules/ecommerce/customers/customers/customers.service';
import { CategoriesService } from '../../modules/inventory/products/categories/categories.service';
import { AttributesService } from '../../modules/inventory/products/attributes/attributes.service';
import { ProductGroupService } from '../../modules/ecommerce/products/groups/product-group.service';
import { OrdersService as OrderService } from '../../modules/ecommerce/sales/orders/orders.service';
import { SubscribersService } from '../../modules/engagement/community/subscribers/subscribers.service';
import { LeaderboardService } from '../../modules/engagement/community/leaderboard/leaderboard.service';
import { AudiencesService } from '../../modules/engagement/audience/audience.service';
import { WebsiteService } from '../../modules/system/apps/apps/website/website.service';
import { LoyaltyService } from '../../modules/system/apps/apps/loyalty/loyalty.service';
import { StaticService } from '../../modules/website/content/static/static.service';
import { SalesService } from '../../modules/system/apps/apps/sales/sales.service';
import { IntegrationService } from '../../modules/system/apps/apps/integration/integration.service';
import { SmsIntegrationService } from '../../modules/system/apps/apps/sms-integration/sms-integration.service';
import { EcommerceService } from '../../modules/system/apps/apps/ecommerce/ecommerce.service';
import { TopBarService } from '../../layouts/topbar/topbar.service';
import { IndexService } from '../../modules/index/index.service';
import { AnalyticsService } from '../../modules/dashboards/analytics/analytics.service';
import { CrmAnalyticsService } from '../../modules/dashboards/crm/crm.service';
import subYears from 'date-fns/subYears';
import startOfToday from 'date-fns/startOfToday';
import endOfToday from 'date-fns/endOfToday';
import { CollaborationAnalyticsService } from '../../modules/dashboards/collaboration/collaboration.service';
import { EcommerceAnalyticsService } from '../../modules/dashboards/ecommerce/ecommerce.service';
import { SalesAnalyticsService } from '../../modules/dashboards/sales/sales.service';
import { RolesService } from '../../modules/system/roles/roles.service';
import { ChatService } from '../../modules/ecommerce/customers/chat/chat.service';
import { QuestTypeService } from '../../modules/system/apps/apps/campaigns/campaigns.service';
import { WalletService } from '../../modules/engagement/wallet/wallet.service';
import { PosService } from './pos.service';
import { CardsService } from '../../modules/engagement/community/cards/cards.service';
import { CampaignsService } from '../../modules/engagement/campaigns/campaign/campaigns.service';
import { ButtonsService } from '../../modules/engagement/campaigns/buttons/buttons.service';
import { NotificationIntegrationService } from '../../modules/system/apps/apps/notifications-integration/notifications-integration.service';
import { ChallengesService } from '../../modules/engagement/campaigns/challenges/challenges.service';
import { OutboundService } from '../../modules/ecommerce/customers/outbound/outbound.service';
import { ReferralsService } from '../../modules/engagement/community/referrals/referrals.service';
import { WalletsService } from '../../modules/engagement/community/wallet/wallets.service';
import { EmailIntegrationService } from '../../modules/system/apps/apps/email-integration/email-integration.service';
import { WidgetService } from '../../modules/system/apps/apps/widget/widget.service';
import { StorageHelper } from '@diktup/frontend/helpers';
import { NewsletterService } from '../../modules/ecommerce/customers/newsletter/newsletter.service';
import { LocationsService } from '../../modules/hr/company/locations/locations.service';
import { ClicksService } from '../../modules/ecommerce/products/clicks/clicks.service';
import { SharedService } from '../../shared/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class ResetApiService {
  private subscr: Subscription;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  filter = {
    from: subYears(startOfToday(), 2),
    to: endOfToday(),
  };
  pos: PointOfSaleType;
  selectedMessageGroup: MessageGroupType;
  contentLanguages: LanguageType[];

  constructor(
    private router: Router,
    private posService: PosService,
    private teamService: TeamService,
    private blogService: BlogService,
    private chatService: ChatService,
    private rolesService: RolesService,
    private indexService: IndexService,
    private brandService: BrandService,
    private stockService: StockService,
    private pagesService: PagesService,
    private orderService: OrderService,
    private salesService: SalesService,
    private cardsService: CardsService,
    private clicksService: ClicksService,
    private topBarService: TopBarService,
    private slidesService: SlidesService,
    private reviewService: RatingService,
    private staticService: StaticService,
    private walletService: WalletService,
    private storageHelper: StorageHelper,
    private widgetService: WidgetService,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    private visualsService: VisualsService,
    private barcodeService: BarcodeService,
    private couponsService: CouponsService,
    private websiteService: WebsiteService,
    private buttonsService: ButtonsService,
    private activatedRoute: ActivatedRoute,
    private walletsService: WalletsService,
    private settingsService: SettingsService,
    private jobsService: JobPositionsService,
    private requestsService: RequestsService,
    private supplierService: SupplierService,
    private productsService: ProductsService,
    private outboundService: OutboundService,
    private referralsService: ReferralsService,
    private campaignsService: CampaignsService,
    private questTypeService: QuestTypeService,
    private audiencesService: AudiencesService,
    private openCartsService: OpenCartsService,
    private customersService: CustomersService,
    private locationsService: LocationsService,
    private warehouseService: WarehouseService,
    private ecommerceService: EcommerceService,
    private analyticsService: AnalyticsService,
    private challengesService: ChallengesService,
    private promotionsService: PromotionsService,
    private categoriesService: CategoriesService,
    private newsletterService: NewsletterService,
    private attributesService: AttributesService,
    private integrationService: IntegrationService,
    private departmentsService: DepartmentsService,
    private subscribersService: SubscribersService,
    private leaderboardService: LeaderboardService,
    private productGroupService: ProductGroupService,
    private crmAnalyticsService: CrmAnalyticsService,
    private jobApplicationService: ApplicationsService,
    private smsIntegrationService: SmsIntegrationService,
    private salesAnalyticsService: SalesAnalyticsService,
    private integrationAppsService: IntegrationAppsService,
    private emailIntegrationService: EmailIntegrationService,
    private ecommerceAnalyticsService: EcommerceAnalyticsService,
    private collaborationAnalyticsService: CollaborationAnalyticsService,
    private notificationIntegrationService: NotificationIntegrationService,
  ) {
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.pos = pos;
    });
  }

  resetData() {
    const fullPath = this.router.url;
    this.sharedService.resetFilter$ = true;
    this.collaborationAnalyticsService.projectsPageIndex = 0;
    this.collaborationAnalyticsService.boardPageIndex = 0;
    this.collaborationAnalyticsService.projectsBoard$ = null;
    this.collaborationAnalyticsService.projects$ = null;
    this.collaborationAnalyticsService.accounts$ = null;
    this.collaborationAnalyticsService.accountsPageIndex = 0;
    if (fullPath.includes('/inventory/products/articles')) {
      this.router.navigate(['/inventory/products/articles'], { relativeTo: this.activatedRoute });
    }
    if (fullPath === '/system/apps/loyalty') {
      location.reload();
    }
    combineLatest([
      this.indexService.getMenuBadges(),
      fullPath === '/'
        ? of(null).pipe(
            switchMap(() => {
              this.indexService.loadingItems$ = true;
              return this.indexService.currentTab$.pipe(
                take(1),
                rxMap((activeTab) => {
                  switch (activeTab) {
                    case 1:
                      return forkJoin([
                        this.topBarService.getAllShortcuts(),
                        this.indexService.getCorporateDashboardByTargetAndUser(),
                        this.indexService.getMainDashboardStats(),
                        this.indexService.getAnalyticsUsersByDevice(this.filter),
                        this.indexService.getActiveQuestsStats(),
                        this.indexService.getSimpleProductWithFilter(5),
                        this.indexService.searchCorporateUsersByTarget(5),
                        this.indexService.getProjectsByTargetWithFilter(5),
                        this.indexService.findBlogsByTargetPaginated(5),
                        this.indexService.getBarcodesByTargetPaginated(5),
                      ]).subscribe();
                    case 2:
                      return this.indexService.findNonPredefinedQuestsByTarget(5).subscribe();
                    case 3:
                      return this.indexService.getSimpleProductWithFilter(5).subscribe();
                    case 4:
                      return this.indexService.searchCorporateUsersByTarget(5).subscribe();
                    case 5:
                      return this.indexService.getProjectsByTargetWithFilter(5).subscribe();
                    case 6:
                      return this.indexService.findBlogsByTargetPaginated(5).subscribe();
                    case 6:
                      return this.indexService.getBarcodesByTargetPaginated(5).subscribe();
                    default:
                      return of(null);
                  }
                }),
              );
            }),
            switchMap(() =>
              forkJoin([
                this.topBarService.getAllShortcuts(),
                this.indexService.getCorporateDashboardByTargetAndUser(),
                this.indexService.getMainDashboardStats(),
                this.indexService.getAnalyticsUsersByDevice(this.filter),
                this.indexService.getActiveQuestsStats(),
              ]),
            ),
          )
        : of(null),
      fullPath === '/dashboard/analytics'
        ? of(null).pipe(
            switchMap(() =>
              forkJoin([
                this.analyticsService.getAnalyticsStats(this.filter),
                this.analyticsService.getAnalyticsUserByCountry(this.filter),
                this.analyticsService.getAnalyticsSessionsByCountries(this.filter),
                this.analyticsService.getAnalyticsAudienceSessionsByCountry(this.filter),
                this.analyticsService.getAnalyticsAudienceMetrics(this.filter),
                this.analyticsService.getAnalyticsUsersByDevice(this.filter),
                this.analyticsService.getAnalyticsTopOperatingSystems(this.filter),
                this.analyticsService.getAnalyticsTopPages(this.filter),
                this.topBarService.getAllShortcuts(),
                this.indexService.getCorporateDashboardByTargetAndUser(),
              ]),
            ),
          )
        : of(null),

      fullPath === '/dashboard/crm'
        ? of(null).pipe(
            switchMap(() =>
              forkJoin([
                this.crmAnalyticsService.getCrmAnalyticsStats(this.filter),
                this.crmAnalyticsService.getCrmAnalyticsSalesForecast(this.filter),
                this.crmAnalyticsService.getCrmAnalyticsDealType(this.filter),
                this.crmAnalyticsService.getCrmAnalyticsBalanceOverview(this.filter),
                this.crmAnalyticsService.getCrmBoardCardProceduresWithFilter(this.filter),
                this.crmAnalyticsService.getUpcommingActivities(this.filter),
                this.crmAnalyticsService.getBoardCardsByCRMBoardWithFilterPaginated(this.filter).pipe(
                  switchMap((res) => {
                    return combineLatest([
                      this.crmAnalyticsService.getBoardListByBoard(res[0]?.boardList?.board?.id),
                      this.crmAnalyticsService.getBoardCardsByBoardWithFilterPaginated(res[0].boardList?.board?.id),
                    ]);
                  }),
                ),
              ]),
            ),
          )
        : of(null),

      fullPath === '/dashboard/sales'
        ? of(null).pipe(
            switchMap(() =>
              forkJoin([
                this.salesAnalyticsService.getSalesAnalyticsStats(this.filter),
                this.salesAnalyticsService.getSalesRevenueChartStats(this.filter),
                this.salesAnalyticsService.getSalesByLocation(this.filter),
                this.salesAnalyticsService.getSalesTopCatalogueCategories(this.filter),
                this.salesAnalyticsService.getSalesOrdersBestSellerProductsWithFilterPaginated(this.filter),
                this.salesAnalyticsService.getSaleOrdersByTargetPaginated(this.filter),
              ]),
            ),
          )
        : of(null),

      fullPath === '/dashboard/collaboration'
        ? of(null).pipe(
            switchMap(() =>
              forkJoin([
                this.collaborationAnalyticsService.getCollaborationAnalyticsStats(this.filter),
                this.collaborationAnalyticsService.getCollaborationProjectsOverview(this.filter),
                this.collaborationAnalyticsService.getCollaborationProjectsStatus(this.filter),
                this.collaborationAnalyticsService.getProjectsByTargetWithFilter(this.filter),
                this.collaborationAnalyticsService.getProjectsBoardCardsByTargetPaginated(this.filter),
                this.collaborationAnalyticsService.getAccountsByTargetWithStatsPaginate(),
                this.collaborationAnalyticsService.getMessageGroupsPagination(),
              ]),
            ),
          )
        : of(null),

      fullPath === '/dashboard/ecommerce'
        ? of(null).pipe(
            switchMap(() =>
              forkJoin([
                this.ecommerceAnalyticsService.getEcommerceRevenueChartStats(this.filter),
                this.ecommerceAnalyticsService.getEcommerceSalesByLocation(this.filter),
                this.ecommerceAnalyticsService.getEcommerceTopCatalogueCategories(this.filter),
                this.ecommerceAnalyticsService.getEcommerceAnalyticsStats(this.filter),
                this.ecommerceAnalyticsService.getEcommerceBestSellerProductsWithFilterPaginated(this.filter),
                this.ecommerceAnalyticsService.findTargetOrders(this.filter),
              ]),
            ),
          )
        : of(null),

      fullPath === '/inventory/brands' ? this.brandService.searchBrand() : of(null),
      fullPath === '/ecommerce/products/clicks' ? this.clicksService.findProductClicksByOwnerPaginated() : of(null),
      // fullPath === '/system/company' ? this.companyService.getCompany() : of(null),
      fullPath === '/hr/company/locations' ? this.locationsService.getLocations() : of(null),
      fullPath === '/inventory/stock/warehouse' ? this.warehouseService.getWarehousesByCompanyPaginated() : of(null),

      fullPath === '/inventory/equipments/equipments' ? this.productsService.searchSimpleEquipments() : of(null),
      fullPath === '/inventory/products/products' || fullPath === '/inventory/equipments/products'
        ? this.productsService.getSimpleProductWithFilter()
        : of(null),
      fullPath === '/inventory/products/articles' || fullPath === '/inventory/equipments/articles'
        ? of(null).pipe(
            switchMap(() => {
              this.productsService.ownersPageIndex = 0;
              this.productsService.techniciansPageIndex = 0;
              this.productsService.owners$ = null;
              this.productsService.ownersPageIndex = 0;
              return forkJoin([
                this.barcodeService.getBarcodesWithVarietyAndStructureWithFilter(true),
                this.barcodeService.getSimpleProductWithFilter(),
                this.barcodeService.searchAttributeByTarget(true),
                this.supplierService.searchInfiniteSuppliersByTarget(),
                this.productsService.getCatalogueCategoriesByTargetWithChildren(),
                this.productsService.getOwners(),
                this.productsService.getTechnicians(),
              ]);
            }),
          )
        : of(null),
      fullPath === '/inventory/products/attributes' || fullPath === '/inventory/equipments/attributes'
        ? this.attributesService.searchAttributeByTarget()
        : of(null),
      fullPath === '/inventory/services/categories' ||
      fullPath === '/inventory/equipments/categories' ||
      fullPath === '/inventory/products/categories'
        ? this.categoriesService.getCategories(1, null, true)
        : of(null),

        fullPath === '/ecommerce/customers/newsletter'
        ? this.newsletterService.getSubscribersToNewsletterPaginated()
        : of(null),

      fullPath === '/inventory/services/services' ? this.barcodeService.getSimpleServicesWithFilter() : of(null),

      fullPath === '/ecommerce/customers/chat'
        ? of(null).pipe(
            switchMap(() => {
              this.customersService.infiniteContacts$ = null;
              this.customersService.searchString$ = '';
              this.chatService.messageGroups$ = [];
              this.chatService.messages$ = null;
              this.chatService.searchString = '';
              this.chatService.messagesPageIndex = 0;
              this.chatService.messageGroupsPageIndex = 0;
              this.customersService.pageIndex = 0;
              return forkJoin([this.chatService.searchSupportMessageGroup(), this.customersService.searchCorporateUsersByTarget()]);
            }),
            switchMap(([res]) => {
              if (res?.length) {
                this.selectedMessageGroup = res[0];
                return this.chatService.getMessagesByMessageGroupPagination(res[0].id);
              } else return of(null);
            }),
            switchMap(() => {
              if (this.selectedMessageGroup?.lastMessage?.unread) {
                return this.chatService.markAllMessageGroupMessagesAsSeen(this.selectedMessageGroup?.id);
              } else return of(null);
            }),
          )
        : of(null),

      fullPath === '/collaboration/chat'
        ? of(null).pipe(
            switchMap(() => {
              this.teamService.infiniteUsers$ = [];
              this.teamService.page = 0;
              this.teamService.searchString = '';
              this.chatService.messageGroups$ = [];
              this.chatService.messages$ = [];
              this.chatService.searchString = '';
              this.chatService.messagesPageIndex = 0;
              this.chatService.messageGroupsPageIndex = 0;
              return forkJoin([this.chatService.searchInternalMessageGroup(), this.teamService.searchAccount()]);
            }),
            switchMap(([res]) => {
              if (res?.length) {
                this.selectedMessageGroup = res[0];
                return this.chatService.getMessagesByMessageGroupPagination(res[0].id);
              } else return of(null);
            }),
            switchMap(() => {
              if (this.selectedMessageGroup?.lastMessage?.unread) {
                return this.chatService.markAllMessageGroupMessagesAsSeen(this.selectedMessageGroup?.id);
              } else return of(null);
            }),
          )
        : of(null),

      fullPath === '/engagement/campaigns'
        ? of(null).pipe(
            switchMap(() => {
              this.questTypeService.pageIndex = 0;
              this.questTypeService.infiniteQuestType$ = null;
              return forkJoin([
                this.campaignsService.findNonPredefinedQuestsByTarget(),
                this.campaignsService.getCampaignsStats(),
                this.questTypeService.getQuestTypesByTargetPaginated(),
              ]);
            }),
          )
        : of(null),

      fullPath === '/system/apps/widget'
        ? of(null).pipe(
            switchMap(() => {
              this.widgetService.selectedVisualsApp$ = 'web';
              this.widgetService.predefinedPageIndex = 0;
              this.loyaltyService.walletPageIndex = 0;
              this.loyaltyService.wallet$ = null;
              this.widgetService.predefined$ = null;
              this.widgetService.staticTranslations$ = null;
              return forkJoin([
                this.widgetService.getWidgetIntegrationByTarget(),
                this.loyaltyService.quantitativeWalletsByOwnerPagination(),
                this.loyaltyService.findLoyaltySettingsByTarget(),
                this.widgetService.getPredefinedPaginated(),
                this.widgetService.getWidgetVisualsByTargetAndAppPaginated(TranslationAppEnum.WIDGET_WEB)
              ])
            }),
            switchMap(([res]) => {
              this.widgetService.selectedStaticApp$ = 'web';
              this.contentLanguages = (res?.multilanguage?.languages || []).map((lang) => lang.language)
              if (this.contentLanguages?.length) {
                return this.widgetService.getStaticTranslationsByTargetAndLanguagePaginated(this.contentLanguages[0]?.id, TranslationAppEnum.WIDGET_WEB)
              }
              return of(null);
            }),
            switchMap((statics) => {
              if (!statics?.length && this.contentLanguages[0]?.id) {
                return this.widgetService.initStaticTranslations(TranslationAppEnum.WIDGET_WEB, this.contentLanguages[0]?.id);
              }
              return of(null);
            }),
            switchMap((result) => {
              if (result?.length) {
                return this.widgetService.getStaticTranslationsByTargetAndLanguagePaginated(this.contentLanguages[0]?.id, TranslationAppEnum.WIDGET_WEB);
              }
              return of(null);
            }),
          )
        : of(null),

      fullPath === '/system/apps/campaigns'
        ? of(null).pipe(
            switchMap(() => {
              this.loyaltyService.wallet$ = null;
              this.loyaltyService.walletPageIndex = 0;
              this.campaignsService.activityPageIndex = 0;
              this.campaignsService.infiniteActivityTypes$ = null;
              this.questTypeService.infiniteCauses$ = null;
              this.questTypeService.targetsByPartner$ = null;
              this.questTypeService.parnterPageIndex = 0;
              this.questTypeService.infinteCausesPageIndex = 0;
              return forkJoin([
                this.questTypeService.getInfiniteCauses(),
                this.questTypeService.getCausesByTargetPaginated(),
                this.questTypeService.getQuestTypesByTargetPaginated(),
                this.questTypeService.getQuestTypesByTargetPaginated(),
                this.loyaltyService.quantitativeWalletsByOwnerPagination(),
                this.loyaltyService.findLoyaltySettingsByTarget(),
                this.campaignsService.getNonPredefinedActivityTypesPaginated(),
                this.questTypeService.getDonationActivityTypesByTargetPaginated(),
                this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination(),
                this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.DONATION),
                this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.ADVERTISER),
              ]);
            }),
          )
        : of(null),

      fullPath === '/engagement/wallet'
        ? of(null).pipe(
            switchMap(() => {
              this.walletService.from = subYears(startOfToday(), 20);
              this.walletService.to = endOfToday();
              this.walletService.dateFilter$ = {
                from: subYears(startOfToday(), 20),
                to: endOfToday(),
              };
              const filter: any = {
                from: this.walletService.from,
                to: this.walletService.to,
                affected: [{ pos: this.storageHelper.getData('posId') }],
              };
              this.walletService.selectedField$ = 'country';
              this.walletService.selectedCategoryField$ = 'overall';
              this.loyaltyService.wallet$ = null;
              this.loyaltyService.walletPageIndex = 0;
              this.customersService.infiniteContacts$ = null;
              this.customersService.pageIndex = 0;
              const countryId = this.pos?.locations?.[0]?.country?.id;
              if (!countryId) {
                this.walletService.coins$ = null
              }
              return forkJoin([
                this.loyaltyService.quantitativeWalletsByOwnerPagination(),
                this.walletService.getWalletTopupsByTargetPaginated(),
                this.walletService.getWalletTransactionsStatsByAffected(),
                this.customersService.searchCorporateUsersByTarget(),
                this.walletService.getWalletTransactionsByAffectedPaginated(filter as any),
                countryId ? this.walletService.getCoinsByCountryPaginated(this.pos.locations?.[0]?.country?.id || null) : of(null),
              ]).pipe(
                switchMap(([res]) => {
                  if (res?.length) {
                    return this.walletService.getWalletTransactionsStatsChartWithFilter({ ...this.filter, wallet: res[0]?.id } as any);
                  }
                  return of(null);
                }),
              );
            }),
          )
        : of(null),

      fullPath === '/engagement/community/subscribers'
        ? of(null).pipe(
            switchMap(() => {
              this.walletService.selectedField$ = 'country';
              return forkJoin([this.loyaltyService.findLoyaltySettingsByTarget(), this.subscribersService.searchTargetSubscribers()]);
            }),
          )
        : of(null),
// fullPath === '/system/apps/kyc' ? this.brandService.searchBrand() : of(null), quantitativeWalletsByOwnerPagination
      fullPath === '/system/apps/kyc'
        ? of(null).pipe(
            switchMap(() => {
              this.loyaltyService.wallet$ = null;
              this.loyaltyService.walletPageIndex = 0;
              return this.loyaltyService.quantitativeWalletsByOwnerPagination();
            }),
          )
        : of(null),

      fullPath === '/engagement/wallet/transactions'
        ? of(null).pipe(
            switchMap(() => {
              this.loyaltyService.wallet$ = null;
              this.loyaltyService.walletPageIndex = 0;
              this.customersService.infiniteContacts$ = null;
              this.customersService.pageIndex = 0;
              return forkJoin([
                this.walletService.getWalletTransactionsStatsByAffected(),
                this.loyaltyService.quantitativeWalletsByOwnerPagination(),
                this.customersService.searchCorporateUsersByTarget(),
                this.walletService.getWalletTransactionsByAffectedPaginated(),
              ]);
            }),
          )
        : of(null),
      fullPath === '/engagement/campaigns/challenges'
        ? of(null).pipe(
            switchMap(() => {
              this.questTypeService.activityTypes$ = null;
              this.questTypeService.infiniteDonations$ = null;
              this.questTypeService.pageIndex = 0;
              this.questTypeService.donationPageIndex = 0;
              return forkJoin([
                this.challengesService.getChallengesByTargetWithDonationProgressPaginated(),
                this.loyaltyService.findLoyaltySettingsByTarget(),
                this.questTypeService.getPredefinedActivityTypesByTargetWithActiveStatusPaginated(),
                this.questTypeService.getDonationActivityTypesByTargetPaginated(),
              ]);
            }),
          )
        : of(null),
      fullPath === '/engagement/campaigns/campaigns'
        ? of(null).pipe(
            switchMap(() => {
              this.questTypeService.infiniteQuestType$ = null;
              this.questTypeService.questTypePageIndex = 0;
              this.campaignsService.infiniteQuests$ = null;
              this.campaignsService.questActivities$ = null;
              this.campaignsService.questPageIndex = 0;
              this.questTypeService.parnterPageIndex = 0;
              this.questTypeService.targetsByPartner$ = null;
              return forkJoin([
                this.campaignsService.getCampaignsStats(),
                this.campaignsService.findNonPredefinedQuestsByTarget(),
                this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination(),
              ]);
            }),
          )
        : of(null),

      fullPath === '/engagement/community/cards'
        ? of(null).pipe(
            switchMap(() => {
              this.visualsService.visuals$ = null;
              return forkJoin([
                this.loyaltyService.findLoyaltySettingsByTarget(),
                this.visualsService.getVisuals(),
                this.cardsService.getCorporateUserCardsByTargetWithReputationsPaginated(),
              ]);
            }),
          )
        : of(null),
      fullPath === '/system/apps/notification' ? this.notificationIntegrationService.getNotificationIntegrationByTarget() : of(null),
      fullPath === '/system/apps/email' ? this.emailIntegrationService.getEmailIntegrationByTarget() : of(null),
      fullPath === '/engagement/audiences' ? this.audiencesService.getAudiencesByTargetPaginated() : of(null),
      fullPath === '/system/permissions' ? this.rolesService.getPermissionsByTarget() : of(null),
      fullPath === '/inventory/stock/stock' ? this.stockService.searchStocksByTarget() : of(null),
      // fullPath === '/inventory/maintenance/schedule' ? this.scheduleService.getMaintenanceBoard() : of(null),
      // fullPath === '/inventory/customers/contacts' ? this.contactsService.getCompanyContactsByCompanyPaginated() : of(null),
      // fullPath === '/inventory/crm/pipeline' ? this.pipelineService.getCRMBoard() : of(null),
      // fullPath === '/crm/tickets' ? this.ticketsService.getTicketsByTargetWithFilter() : of(null),
      // fullPath === '/crm/tickets' ? this.ticketsService.getTicketsStatsWithFilter() : of(null),
      // fullPath === '/sales/quotations' ? this.quotationsService.getQuotationsStatsWithFilter() : of(null),
      // fullPath === '/sales/quotations' ? this.quotationsService.getQuotationsByTargetPaginated() : of(null),
      // fullPath === '/sales/orders' ? this.ordersService.getSaleOrdersByTargetPaginated() : of(null),
      // fullPath === '/sales/orders' ? this.ordersService.getSaleOrdersStatsWithFilter() : of(null),
      // fullPath === '/sales/delivery-notes' ? this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated() : of(null),
      // fullPath === '/sales/delivery-notes' ? this.deliveryNotesService.getSaleDeliveryNoteStatsWithFilter() : of(null),
      // fullPath === '/sales/issue-notes' ? this.issueNotesService.getSaleIssueNotesStatsWithFilter() : of(null),
      // fullPath === '/sales/issue-notes' ? this.issueNotesService.getSaleIssueNotesByTargetPaginated() : of(null),
      // fullPath === '/sales/invoices' ? this.invoicesService.getSaleInvoicesByTargetPaginated() : of(null),
      // fullPath === '/sales/invoices' ? this.invoicesService.getSaleInvoicesStatsWithFilter() : of(null),
      // fullPath === '/purchases/purchases' ? this.purchasesService.getPurchaseOrdersStatsWithFilter() : of(null),
      // fullPath === '/purchases/purchases' ? this.purchasesService.getPurchaseOrdersByTargetPaginated() : of(null),
      // fullPath === '/purchases/notes' ? this.notesService.getPurchaseDeliveryNotesByTargetPaginated() : of(null),
      // fullPath === '/purchases/notes' ? this.notesService.getPurchaseDeliveryNoteStatsWithFilter() : of(null),
      // fullPath === '/purchases/invoices' ? this.purchaseInvoicesService.getPurchaseInvoicesByTargetPaginated() : of(null),
      // fullPath === '/purchases/invoices' ? this.purchaseInvoicesService.getPurchaseInvoicesStatsWithFilter() : of(null),
      // fullPath === '/purchases/suppliers' ? this.supplierService.searchSuppliersByTarget() : of(null),
      // fullPath === '/collaboration/projects/all' ? this.projectsService.getProjectsByTargetWithFilter() : of(null),
      // fullPath === '/collaboration/tasks/all' ? this.tasksService.getBoardsPaginated() : of(null),
      // fullPath === '/collaboration/todo/all' ? this.todoService.getSections() : of(null),
      fullPath === '/website/content/pages' ? this.pagesService.findLandingPagesByTargetAndTypeAndStatusPaginated() : of(null),
      fullPath === '/website/content/visuals' ? this.visualsService.getVisuals() : of(null),
      fullPath === '/website/content/slides' ? this.slidesService.getSlides() : of(null),
      fullPath === '/website/blog' ? this.blogService.findBlogsByTargetPaginated() : of(null),
      fullPath === '/website/requests' ? this.requestsService.getRequestsByTypeAndTargetPaginated() : of(null),
      fullPath === '/ecommerce/products/groups' ? this.productGroupService.getInternalProductsByClass([ProductClassEnum.TOP_PRODUCTS]) : of(null),
      fullPath === '/ecommerce/products/ratings' ? this.reviewService.getCorporateRatingAssignmentByTarget() : of(null),
      fullPath === '/ecommerce/products/orders' ? this.orderService.findTargetOrders() : of(null),
      fullPath === '/ecommerce/sales/carts' ? this.openCartsService.findTargetShoppingCarts() : of(null),
      fullPath === '/ecommerce/sales/coupons' ? this.couponsService.findCouponsByTargetWithFilterPaginated() : of(null),
      fullPath === '/ecommerce/sales/orders' ? this.orderService.findTargetOrders() : of(null),
      fullPath === '/ecommerce/customers/customers' ? this.customersService.searchCorporateUsersByTarget() : of(null),
      fullPath === '/engagement/community/leaderboard'
        ? this.leaderboardService.getLiveLeaderboardByCyclePaginated(LeaderboardCycleEnum.OVERALL)
        : of(null),
      fullPath === '/hr/career/positions/all' ? this.jobsService.searchJobDefinitionsByTarget() : of(null),
      fullPath === '/hr/career/applications/all' ? this.jobApplicationService.getJobApplicationsByTargetWithFilterPagination() : of(null),
      fullPath === '/hr/company/departments' ? this.departmentsService.getDepartments() : of(null),
      fullPath === '/system/settings' ? this.settingsService.searchLogisticCompaniesByTarget() : of(null),
      fullPath === '/system/apps' ? this.integrationAppsService.findPluginsWithAddedStatus() : of(null),
      fullPath === '/engagement/audiences' ? this.audiencesService.getAudiencesByTargetPaginated() : of(null),
      fullPath === '/system/apps/website' ? this.websiteService.getWebsiteIntegrationByTarget() : of(null),
      fullPath === '/website/content/static' ? this.staticService.getStaticTranslationsByTargetAndLanguagePaginated() : of(null),
      fullPath === '/website/content/static' ? this.websiteService.getWebsiteIntegrationByTarget() : of(null),
      fullPath === '/system/apps/sales' ? this.salesService.getSalesIntegrationByTarget() : of(null),
      fullPath === '/system/apps/integration' ? this.integrationService.getIntegrationIntegrationByTarget() : of(null),
      fullPath === '/system/apps/sms' ? this.smsIntegrationService.getSmsIntegrationByTarget() : of(null),
      fullPath === '/system/apps/ecommerce' ? this.ecommerceService.getCorporateEmailsByTargetPaginated() : of(null),
      // fullPath === '/crm/pipeline' ? this.pipelineService.getCRMBoard() : of(null),
      // fullPath === '/collaboration/todo/all' ? this.todoService.getSections() : of(null),
      fullPath === '/ecommerce/sales/promotions' ? this.promotionsService.getPromotionsByTargetPagination() : of(null),
      fullPath === '/engagement/community/wallets' ? this.walletsService.getTargetUsersWithWallets() : of(null),
      fullPath === '/engagement/campaigns/buttons'
        ? of(null).pipe(
            switchMap(() => {
              this.loyaltyService.wallet$ = null;
              this.loyaltyService.walletPageIndex = 0;
              this.buttonsService.activityTypes$ = null;
              this.buttonsService.predefinedPageIndex = 0;
              this.buttonsService.predefined$ = null;
              return forkJoin([
                this.buttonsService.getWidgetIntegrationByTarget(),
                this.loyaltyService.quantitativeWalletsByOwnerPagination(),
                this.buttonsService.getPredefinedPaginated(),
                this.buttonsService.getPredefinedActivityTypesPaginated(),
              ]);
            }),
          )
        : of(null),

      fullPath === '/system/apps/ecommerce'
        ? of(null).pipe(
            switchMap(() => {
              return forkJoin([
                this.ecommerceService.getCorporateEmailsByTargetPaginated(),
                this.ecommerceService.getOrderSettings(),
                this.ecommerceService.getCorporateEmailsByTargetPaginated(),
                this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.MARKETPLACE)
              ]);
            }),
          )
        : of(null),

      // fullPath === '/system/apps/loyalty'
      //   ? of(null).pipe(
      //       switchMap(() => {
      //         this.questTypeService.parnterPageIndex = 0;
      //         this.questTypeService.targetsByPartner$ = null;
      //         this.loyaltyService.wallet$ = null;
      //         this.loyaltyService.walletPageIndex = 0;
      //         return forkJoin([
      //           this.loyaltyService.getReputationsByTarget(),
      //           this.loyaltyService.findLoyaltySettingsByTarget(),
      //           this.loyaltyService.quantitativeWalletsByOwnerPagination(),
      //           this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination(),
      //         ]);
      //       }),
      //     )
      //   : of(null),

      fullPath === '/inventory/stock/warehouse'
        ? of(null).pipe(
            switchMap(() => {
              this.warehouseService.pageIndex = 0;
              this.warehouseService.infinitWarehouses$ = null;
              return this.warehouseService.getWarehousesByCompanyPaginated();
            }),
          )
        : of(null),

      fullPath === '/engagement/wallet/wallet-topup'
        ? of(null).pipe(
            switchMap(() => {
              this.buttonsService.pageIndex = 0;
              this.loyaltyService.walletPageIndex = 0;
              this.loyaltyService.wallet$ = null;
              return forkJoin([this.walletService.getWalletTopupsByTargetPaginated(), this.loyaltyService.quantitativeWalletsByOwnerPagination(), this.loyaltyService.findLoyaltySettingsByTarget()]);
            }),
          )
        : of(null),

      fullPath === '/engagement/community/referrals'
        ? of(null).pipe(
            switchMap(() => {
              this.referralsService.pageIndex = 0;
              return forkJoin([this.referralsService.getReferralsByTargetPagination(), this.loyaltyService.findLoyaltySettingsByTarget()]);
            }),
          )
        : of(null),
      // fullPath === '/inventory/customers/companies'
      //   ? of(null).pipe(
      //       switchMap(() => {
      //         this.companiesService.infiniteCompanies$ = null;
      //         this.companiesService.pageIndex = 0;
      //         return this.companiesService.searchCustomersByTarget();
      //       }),
      //     )
      //   : of(null),
      // fullPath === '/inventory/customers/leads'
      //   ? of(null).pipe(
      //       switchMap(() => {
      //         this.companiesService.infiniteLeads$ = null;
      //         this.companiesService.leadsPageIndex = 0;
      //         return this.companiesService.searchLeadsByTarget();
      //       }),
      //     )
      //   : of(null),
      fullPath === '/ecommerce/customers/outbound'
        ? of(null).pipe(
            switchMap(() => {
              this.outboundService.pageIndex = 0;
              return this.outboundService.getOutboundsByTargetPagination();
            }),
          )
        : of(null),
      fullPath === '/system/team'
        ? of(null).pipe(
            switchMap(() => {
              this.teamService.page = 0;
              this.teamService.infiniteTeam$ = null;
              this.teamService.infiniteUsers$ = null;
              return this.teamService.getTeam();
            }),
          )
        : of(null),
      fullPath === '/system/apps/website'
        ? of(null).pipe(
            switchMap(() => {
              this.websiteService.emails$ = null;
              this.buttonsService.activityTypes$ = null;
              return forkJoin([
                this.websiteService.findCorporateTemplateByTarget(),
                this.websiteService.getSeo(),
                this.smsIntegrationService.getSmsIntegrationByTarget(),
                this.websiteService.getCorporateEmailsByTargetPaginated(),
              ]);
            }),
          )
        : of(null),
    ]).subscribe();
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
