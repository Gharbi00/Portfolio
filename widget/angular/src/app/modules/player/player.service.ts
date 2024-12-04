import { Injectable } from '@angular/core';
import { map, BehaviorSubject, Observable, switchMap, of, take } from 'rxjs';

import {
  WalletType,
  UserStatus,
  VisualsType,
  ReferralType,
  OutboundType,
  PointOfSaleGQL,
  ReputationType,
  PointOfSaleType,
  QuestStatusEnum,
  LinkAccountType,
  WidgetVisualsType,
  ProductClicksType,
  GetLastReferralGQL,
  LinkUserAccountGQL,
  TranslationAppEnum,
  LoyaltySettingsType,
  PartnershipTypeEnum,
  CorporateUserCardType,
  WidgetIntegrationType,
  SendValidationCodeGQL,
  CountUnseenMessagesGQL,
  PartnershipNetworkType,
  CorporateUserExistType,
  SuccessResponseDtoType,
  FindVisualsByTargetGQL,
  CreateProductClicksGQL,
  QuestWithRepeatDateType,
  MarkAllMessageAsSeenGQL,
  IsLoginForTargetExistGQL,
  GetReputationsByTargetGQL,
  InternalProductFilterType,
  IsLoginForTargetExistInput,
  WalletWithReputationDtoType,
  ReputationWithoutTargetType,
  FindLoyaltySettingsByTargetGQL,
  ValidateLinkOrCodeForTargetGQL,
  GetUserWalletWithReputationsGQL,
  GetWidgetIntegrationByTargetGQL,
  SaveCurrentCorporateUserStatusGQL,
  GetLastWidgetOutboundsByTargetGQL,
  CurrentUserReputationsLossDateType,
  CorporateOutboundNotificationInput,
  GetCurrentUserQuantitativeWalletsGQL,
  GetCurrentUserReputationsLossDateGQL,
  GetCorporateUserCardByUserAndTargetGQL,
  CreateOutboundCorporateNotificationGQL,
  GetWidgetVisualsByTargetAndAppPaginatedGQL,
  FindPredefinedQuestsByTargetWithRepeatDateGQL,
  GetCurrentUserLinkedCorporateAccountByTargetGQL,
  GetPartnershipNetworksByTargetAndPartnershipPaginationGQL,
  GetSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilterGQL,
  InternalProductForPartnershipNetworkWithRatingsPaginateWithFavoriteStatusWithFilterType,
  InternalProductForPartnershipNetworkFilterInput,
  CurrentUserReputationsTurnoverLossDateType,
  GetCurrentUserReputationsTurnoverLossDateGQL,
} from '@sifca-monorepo/widget-generator';
import { FetchPolicy } from '@apollo/client/core';
import { StorageHelper } from '@diktup/frontend/helpers';
import { IPagination } from '@diktup/frontend/models';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
declare const gapi: any;

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private clientId: string = '972746558514-hbr6vh06u52rat4dc8melar4j7ao717r.apps.googleusercontent.com';
  private loadingProducts: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private levelColor: BehaviorSubject<string> = new BehaviorSubject('');
  private userToken: BehaviorSubject<string> = new BehaviorSubject('');
  private pos: BehaviorSubject<PointOfSaleType> = new BehaviorSubject(null);
  private remainingPoints: BehaviorSubject<number> = new BehaviorSubject(0);
  private isLastProducts: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private connectButton: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isFinalLevel: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private authenticated: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingQuests: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private loadingLoyalty: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loginVibrating: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private unseenMessagesCount: BehaviorSubject<number> = new BehaviorSubject(null);
  private currentPage: BehaviorSubject<number> = new BehaviorSubject(1);
  private currentLevelPercentage: BehaviorSubject<number> = new BehaviorSubject(0);
  private widgetVisuals: BehaviorSubject<WidgetVisualsType[]> = new BehaviorSubject(null);
  private productsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private reputations: BehaviorSubject<ReputationType[]> = new BehaviorSubject(null);
  private quantitativeWallet: BehaviorSubject<WalletType> = new BehaviorSubject(null);
  private partnershiPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private userCard: BehaviorSubject<CorporateUserCardType[]> = new BehaviorSubject(null);
  private lastReferral: BehaviorSubject<ReferralType> = new BehaviorSubject(null);
  private lastWidgetOutbound: BehaviorSubject<OutboundType> = new BehaviorSubject(null);
  private quests: BehaviorSubject<QuestWithRepeatDateType[]> = new BehaviorSubject(null);
  private wallet: BehaviorSubject<WalletWithReputationDtoType> = new BehaviorSubject(null);
  private loyaltySettings: BehaviorSubject<LoyaltySettingsType> = new BehaviorSubject(null);
  private partnership: BehaviorSubject<PartnershipNetworkType[]> = new BehaviorSubject(null);
  private widgetSettings: BehaviorSubject<WidgetIntegrationType> = new BehaviorSubject(null);
  private selectedPartner: BehaviorSubject<PartnershipNetworkType> = new BehaviorSubject(null);
  private nextLevel: BehaviorSubject<ReputationWithoutTargetType> = new BehaviorSubject(null);
  private currentLevel: BehaviorSubject<ReputationWithoutTargetType> = new BehaviorSubject(null);
  private frequencyLossDate: BehaviorSubject<CurrentUserReputationsLossDateType> = new BehaviorSubject(null);
  private turnoverLossDate: BehaviorSubject<CurrentUserReputationsLossDateType> = new BehaviorSubject(null);
  private filtredProducts: BehaviorSubject<InternalProductForPartnershipNetworkWithRatingsPaginateWithFavoriteStatusWithFilterType> =
    new BehaviorSubject(null);
  private filter: BehaviorSubject<InternalProductFilterType> = new BehaviorSubject(null);
  private ipApiUrl = 'https://jsonip.com';

  pageIndex = 0;
  pageLimit = 10;
  productsPageIndex = 0;
  productsLimit = 12;
  searchString = '';
  selectedCategories: string[] = [];
  productAttributes: string[] = [];
  selectedCategorie: string[] = [];
  selectedBrands: string[] = [];

  get filter$(): Observable<InternalProductFilterType> {
    return this.filter.asObservable();
  }

  get loadingProducts$(): Observable<boolean> {
    return this.loadingProducts.asObservable();
  }

  get filtredProducts$(): Observable<InternalProductForPartnershipNetworkWithRatingsPaginateWithFavoriteStatusWithFilterType> {
    return this.filtredProducts.asObservable();
  }

  get isLastProducts$(): Observable<boolean> {
    return this.isLastProducts.asObservable();
  }

  get lastReferral$(): Observable<ReferralType> {
    return this.lastReferral.asObservable();
  }

  get lastWidgetOutbound$(): Observable<OutboundType> {
    return this.lastWidgetOutbound.asObservable();
  }

  get unseenMessagesCount$(): Observable<number> {
    return this.unseenMessagesCount.asObservable();
  }

  get currentPage$(): Observable<number> {
    return this.currentPage.asObservable();
  }
  set currentPage$(value: any) {
    this.currentPage.next(value);
  }

  get userToken$(): Observable<string> {
    return this.userToken.asObservable();
  }
  set userToken$(value: any) {
    this.userToken.next(value);
  }

  get connectButton$(): Observable<boolean> {
    return this.connectButton.asObservable();
  }
  set connectButton$(value: any) {
    this.connectButton.next(value);
  }

  get selectedPartner$(): Observable<PartnershipNetworkType> {
    return this.selectedPartner.asObservable();
  }
  set selectedPartner$(value: any) {
    this.selectedPartner.next(value);
  }

  get loadingQuests$(): Observable<boolean> {
    return this.loadingQuests.asObservable();
  }

  get reputations$(): Observable<ReputationType[]> {
    return this.reputations.asObservable();
  }

  get nextLevel$(): Observable<ReputationWithoutTargetType> {
    return this.nextLevel.asObservable();
  }
  set nextLevel$(value: any) {
    this.nextLevel.next(value);
  }

  get isFinalLevel$(): Observable<boolean> {
    return this.isFinalLevel.asObservable();
  }
  set isFinalLevel$(value: any) {
    this.isFinalLevel.next(value);
  }

  get quests$(): Observable<QuestWithRepeatDateType[]> {
    return this.quests.asObservable();
  }

  get currentLevel$(): Observable<ReputationWithoutTargetType> {
    return this.currentLevel.asObservable();
  }
  set currentLevel$(value: any) {
    this.currentLevel.next(value);
  }

  get userCard$(): Observable<CorporateUserCardType[]> {
    return this.userCard.asObservable();
  }

  get remainingPoints$(): Observable<number> {
    return this.remainingPoints.asObservable();
  }
  set remainingPoints$(value: any) {
    this.remainingPoints.next(value);
  }
  get currentLevelPercentage$(): Observable<number> {
    return this.currentLevelPercentage.asObservable();
  }
  set currentLevelPercentage$(value: any) {
    this.currentLevelPercentage.next(value);
  }

  get levelColor$(): Observable<string> {
    return this.levelColor.asObservable();
  }
  set levelColor$(value: any) {
    this.levelColor.next(value);
  }

  get frequencyLossDate$(): Observable<CurrentUserReputationsLossDateType> {
    return this.frequencyLossDate.asObservable();
  }

  get turnoverLossDate$(): Observable<CurrentUserReputationsLossDateType> {
    return this.turnoverLossDate.asObservable();
  }

  get quantitativeWallet$(): Observable<WalletType> {
    return this.quantitativeWallet.asObservable();
  }

  get pos$(): Observable<PointOfSaleType> {
    return this.pos.asObservable();
  }

  get loadingLoyalty$(): Observable<boolean> {
    return this.loadingLoyalty.asObservable();
  }
  set loadingLoyalty$(value: any) {
    this.loadingLoyalty.next(value);
  }

  get wallet$(): Observable<WalletWithReputationDtoType> {
    return this.wallet.asObservable();
  }
  set wallet$(value: any) {
    this.wallet.next(value);
  }

  get widgetSettings$(): Observable<WidgetIntegrationType> {
    return this.widgetSettings.asObservable();
  }

  get loyaltySettings$(): Observable<LoyaltySettingsType> {
    return this.loyaltySettings.asObservable();
  }

  get authenticated$(): Observable<boolean> {
    return this.authenticated.asObservable();
  }
  set authenticated$(value: any) {
    this.authenticated.next(value);
  }

  get partnership$(): Observable<PartnershipNetworkType[]> {
    return this.partnership.asObservable();
  }
  set partnership$(value: any) {
    this.partnership.next(value);
  }

  get partnershiPagination$(): Observable<IPagination> {
    return this.partnershiPagination.asObservable();
  }

  get widgetVisuals$(): Observable<WidgetVisualsType[]> {
    return this.widgetVisuals.asObservable();
  }

  get productsPagination$(): Observable<IPagination> {
    return this.productsPagination.asObservable();
  }

  get loginVibrating$(): Observable<boolean> {
    return this.loginVibrating.asObservable();
  }
  set loginVibrating$(value: any) {
    this.loginVibrating.next(value);
  }

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private pointOfSaleGQL: PointOfSaleGQL,
    private getLastReferralGQL: GetLastReferralGQL,
    private linkUserAccountGQL: LinkUserAccountGQL,
    private createProductClicksGQL: CreateProductClicksGQL,
    private findVisualsByTargetGQL: FindVisualsByTargetGQL,
    private countUnseenMessagesGQL: CountUnseenMessagesGQL,
    private markAllMessageAsSeenGQL: MarkAllMessageAsSeenGQL,
    private isLoginForTargetExistGQL: IsLoginForTargetExistGQL,
    private sendValidationCodeOrLinkGQL: SendValidationCodeGQL,
    private getReputationsByTargetGQL: GetReputationsByTargetGQL,
    private validateLinkOrCodeForTargetGQL: ValidateLinkOrCodeForTargetGQL,
    private findLoyaltySettingsByTargetGQL: FindLoyaltySettingsByTargetGQL,
    private getUserWalletWithReputationsGQL: GetUserWalletWithReputationsGQL,
    private getWidgetIntegrationByTargetGQL: GetWidgetIntegrationByTargetGQL,
    private saveCurrentCorporateUserStatusGQL: SaveCurrentCorporateUserStatusGQL,
    private getLastWidgetOutboundsByTargetGQL: GetLastWidgetOutboundsByTargetGQL,
    private getCurrentUserQuantitativeWalletsGQL: GetCurrentUserQuantitativeWalletsGQL,
    private getCurrentUserReputationsLossDateGQL: GetCurrentUserReputationsLossDateGQL,
    private createOutboundCorporateNotificationGQL: CreateOutboundCorporateNotificationGQL,
    private getCorporateUserCardByUserAndTargetGQL: GetCorporateUserCardByUserAndTargetGQL,
    private getWidgetVisualsByTargetAndAppPaginatedGQL: GetWidgetVisualsByTargetAndAppPaginatedGQL,
    private getCurrentUserReputationsTurnoverLossDateGQL: GetCurrentUserReputationsTurnoverLossDateGQL,
    private findPredefinedQuestsByTargetWithRepeatDateGQL: FindPredefinedQuestsByTargetWithRepeatDateGQL,
    private getCurrentUserLinkedCorporateAccountByTargetGQL: GetCurrentUserLinkedCorporateAccountByTargetGQL,
    private getPartnershipNetworksByTargetAndPartnershipPaginationGQL: GetPartnershipNetworksByTargetAndPartnershipPaginationGQL,
    private getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilterGQL: GetSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilterGQL,
  ) {
    const accessToken = this.storageHelper.getData('elvkwdigttoken');
    if (accessToken) {
      this.authenticated.next(true);
    } else {
      this.authenticated.next(false);
    }
  }

  getPublicIp(): Observable<{ ip: string }> {
    return this.http.get<{ ip: string }>(this.ipApiUrl);
  }

  initGoogleSignIn() {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: this.clientId,
      });
    });
  }

  signIn() {
    const auth2 = gapi.auth2.getAuthInstance();
    console.log('🚀 ~ PlayerService ~ signIn ~ auth2:', auth2);
    return auth2.signIn();
  }

  signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    return auth2.signOut();
  }

  getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter(
    isInitial = true,
    filter?: InternalProductForPartnershipNetworkFilterInput,
    sort?: any,
  ): Observable<InternalProductForPartnershipNetworkWithRatingsPaginateWithFavoriteStatusWithFilterType> {
    this.loadingProducts.next(true);
    return this.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilterGQL
      .fetch({
        target: { pos: (window as any).widgetInit.appId },
        ...(this.searchString ? { searchString: this.searchString } : ''),
        pagination: { page: this.productsPageIndex, limit: this.productsLimit },
        ...(sort?.length ? { sort } : {}),
        filter: {
          partners: { pos: ['62a2fb779577aff6c1dde8a5'] },
          ...(filter?.fromPrice && filter.fromPrice !== '0' ? { fromPrice: filter.fromPrice } : ''),
          ...(filter?.toPrice ? { toPrice: filter.toPrice } : ''),
        },
      })
      .pipe(
        map(({ data }: any) => {
          this.productsPagination.next({
            page: this.productsPageIndex,
            size: this.productsLimit,
            length: data.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter?.count,
          });
          if (isInitial) {
            this.filter.next(data.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter.filter);
          }
          this.loadingProducts.next(false);
          this.isLastProducts.next(data.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter.isLast);
          this.filtredProducts.next(data.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter);
          return data.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter;
        }),
      );
  }

  createProductClicks(product): Observable<ProductClicksType> {
    return this.createProductClicksGQL
      .mutate({
        input: { product, target: { pos: (window as any).widgetInit.appId }, user: this.storageHelper.getData('elevkusr') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.createProductClicks;
          }
        }),
      );
  }

  getPartnershipNetworksByTargetAndPartnershipPagination(): Observable<PartnershipNetworkType[]> {
    return this.getPartnershipNetworksByTargetAndPartnershipPaginationGQL
      .fetch({
        target: { pos: (window as any).widgetInit.appId },
        pagination: {
          page: this.pageIndex,
          limit: this.pageLimit,
        },
        partnership: [PartnershipTypeEnum.CONVERSION],
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.partnershiPagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getPartnershipNetworksByTargetAndPartnershipPagination?.count,
            });
            this.partnership.next(data.getPartnershipNetworksByTargetAndPartnershipPagination.objects);
            return data.getPartnershipNetworksByTargetAndPartnershipPagination.objects;
          }
        }),
      );
  }

  createOutboundCorporateNotification(input: CorporateOutboundNotificationInput): Observable<WidgetVisualsType[]> {
    return this.createOutboundCorporateNotificationGQL.mutate({ input: { ...input, target: { pos: (window as any).widgetInit.appId } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.createOutboundCorporateNotification;
        }
      }),
    );
  }

  getWidgetVisualsByTargetAndAppPaginated(fetchPolicy: FetchPolicy = 'cache-first'): Observable<WidgetVisualsType[]> {
    return this.getWidgetVisualsByTargetAndAppPaginatedGQL
      .fetch(
        { app: TranslationAppEnum.WIDGET_WEB, target: { pos: (window as any).widgetInit.appId }, pagination: { limit: 100000 } },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.widgetVisuals.next(data.getWidgetVisualsByTargetAndAppPaginated.objects);
            return data.getWidgetVisualsByTargetAndAppPaginated.objects;
          }
        }),
      );
  }

  findVisualsByTarget(posId?: string): Observable<VisualsType> {
    return this.findVisualsByTargetGQL
      .fetch({ target: posId ? { pos: posId } : { pos: (window as any).widgetInit.appId } })
      .pipe(map(({ data }: any) => data.findVisualsByTarget));
  }

  markAllMessageGroupMessagesAsSeen(messageGroupId: string): Observable<boolean> {
    return this.markAllMessageAsSeenGQL.mutate({ messageGroup: messageGroupId }).pipe(map(({ data }) => data.markAllMessageAsSeen.success));
  }

  getCurrentUserLinkedCorporateAccountByTarget(partnerId: string): Observable<LinkAccountType> {
    // {target: {pos: (window as any).widgetInit.appId} }
    return this.getCurrentUserLinkedCorporateAccountByTargetGQL
      .fetch({
        target: { pos: partnerId },
        // ...partnerId ? {target: {pos: partnerId}} : {target: {pos: (window as any).widgetInit.appId}}
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getCurrentUserLinkedCorporateAccountByTarget;
          }
        }),
      );
  }

  linkUserAccount(reference: string): Observable<SuccessResponseDtoType> {
    return this.selectedPartner$.pipe(
      take(1),
      switchMap((pos) => {
        return this.linkUserAccountGQL
          .mutate({
            reference,
            target: { pos: pos?.partner?.pos?.id },
          })
          .pipe(
            map(({ data }: any) => {
              if (data) {
                return data.linkUserAccount;
              }
            }),
          );
      }),
    );
  }

  sendValidationCodeOrLink(input: any): Observable<SuccessResponseDtoType> {
    return this.selectedPartner$.pipe(
      take(1),
      switchMap((pos) => {
        return this.translate.get('EMAIL_SUBJECT').pipe(
          switchMap((subject) => {
            return this.sendValidationCodeOrLinkGQL
              .mutate({
                subject: subject,
                ...(input?.email ? { email: input.email } : {}),
                ...(input?.phone?.number ? { phone: input?.phone } : {}),
                target: { pos: pos?.partner?.pos?.id },
              })
              .pipe(
                map(({ data }: any) => {
                  if (data) {
                    return data.sendValidationCodeOrLink;
                  }
                }),
              );
          }),
        );
      }),
    );
  }

  validateLinkOrCodeForTarget(code: number): Observable<SuccessResponseDtoType> {
    return this.selectedPartner$.pipe(
      switchMap((pos) => {
        return this.validateLinkOrCodeForTargetGQL
          .mutate({
            code,
            target: { pos: pos?.partner?.pos?.id },
          })
          .pipe(
            take(1),
            map(({ data }: any) => {
              if (data) {
                return data.validateLinkOrCodeForTarget;
              }
            }),
          );
      }),
    );
  }

  isLoginForTargetExist(input: IsLoginForTargetExistInput): Observable<CorporateUserExistType> {
    return this.selectedPartner$.pipe(
      take(1),
      switchMap((pos) => {
        return this.isLoginForTargetExistGQL.fetch({ input: { ...input, target: { pos: pos?.partner?.pos?.id } } }).pipe(
          map(({ data }: any) => {
            if (data) {
              return data.isLoginForTargetExist;
            }
          }),
        );
      }),
    );
  }

  isLoginForTargetAndPosExist(input: IsLoginForTargetExistInput): Observable<CorporateUserExistType> {
    return this.isLoginForTargetExistGQL.fetch({ input: { ...input, target: { pos: (window as any).widgetInit.appId } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.isLoginForTargetExist;
        }
      }),
    );
  }

  sendValidationCodeOrLinkForPos(input: any): Observable<SuccessResponseDtoType> {
    return this.translate.get('EMAIL_SUBJECT').pipe(
      switchMap((subject) => {
        return this.sendValidationCodeOrLinkGQL
          .mutate({
            subject: subject,
            ...(input?.email ? { email: input.email } : {}),
            ...(input?.phone?.number ? { phone: input?.phone } : {}),
            target: { pos: (window as any).widgetInit.appId },
          })
          .pipe(
            map(({ data }: any) => {
              if (data) {
                return data.sendValidationCodeOrLink;
              }
            }),
          );
      }),
    );
  }

  countUnseenMessages(): Observable<number> {
    return this.countUnseenMessagesGQL.fetch().pipe(
      map(({ data }: any) => {
        if (data) {
          this.unseenMessagesCount.next(data.countUnseenMessages.unseenMessagesCount);
          return data.countUnseenMessages.unseenMessagesCount;
        }
      }),
    );
  }

  findPredefinedQuestsByTargetWithRepeatDate(): Observable<QuestWithRepeatDateType[]> {
    this.loadingQuests.next(true);
    return this.findPredefinedQuestsByTargetWithRepeatDateGQL
      .fetch({ target: { pos: (window as any).widgetInit.appId }, filter: { status: [QuestStatusEnum.ONGOING] } })
      .pipe(
        map(({ data }: any) => {
          this.loadingQuests.next(false);
          if (data) {
            this.quests.next(data.findPredefinedQuestsByTargetWithRepeatDate);
            return data.findPredefinedQuestsByTargetWithRepeatDate;
          }
        }),
      );
  }

  getLastReferral(userToken?: string): Observable<ReferralType> {
    return this.getLastReferralGQL.fetch({ ...(userToken ? { userToken } : {}) }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.lastReferral.next(data.getLastReferral);
          return data.getLastReferral;
        }
      }),
    );
  }

  getCorporateUserCardByUserAndTarget(): Observable<CorporateUserCardType[]> {
    return this.getCorporateUserCardByUserAndTargetGQL.fetch({ target: { pos: (window as any).widgetInit.appId } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.userCard.next(data.getCorporateUserCardByUserAndTarget);
          return data.getCorporateUserCardByUserAndTarget;
        }
      }),
    );
  }

  getCurrentUserReputationsLossDate(userToken?: string): Observable<CurrentUserReputationsLossDateType> {
    return this.getCurrentUserReputationsLossDateGQL.fetch({ ...(userToken ? { userToken } : {}) }).pipe(
      map(({ data }: any) => {
        this.frequencyLossDate.next(data?.getCurrentUserReputationsLossDate);
        return data?.getCurrentUserReputationsLossDate;
      }),
    );
  }

  getCurrentUserReputationsTurnoverLossDate(userToken?: string): Observable<CurrentUserReputationsTurnoverLossDateType> {
    return this.getCurrentUserReputationsTurnoverLossDateGQL.fetch({ ...(userToken ? { userToken } : {}) }).pipe(
      map(({ data }: any) => {
        this.turnoverLossDate.next(data?.getCurrentUserReputationsTurnoverLossDate);
        return data.getCurrentUserReputationsTurnoverLossDate;
      }),
    );
  }

  getPos(fetchPolicy: FetchPolicy = 'network-only'): Observable<PointOfSaleType> {
    return this.pointOfSaleGQL.fetch({ id: (window as any).widgetInit.appId }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        this.pos.next(data?.pointOfSale);
        return data?.pointOfSale;
      }),
    );
  }

  getLastWidgetOutboundsByTarget(): Observable<OutboundType> {
    return this.getLastWidgetOutboundsByTargetGQL.fetch({ target: { pos: (window as any).widgetInit.appId } }).pipe(
      map(({ data }: any) => {
        this.lastWidgetOutbound.next(data?.getLastWidgetOutboundsByTarget);
        return data?.getLastWidgetOutboundsByTarget;
      }),
    );
  }

  getWidgetIntegrationByTarget(): Observable<WidgetIntegrationType> {
    return this.getWidgetIntegrationByTargetGQL.fetch({ target: { pos: (window as any).widgetInit.appId } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.widgetSettings.next(data.getWidgetIntegrationByTarget);
          return data.getWidgetIntegrationByTarget as any;
        }
      }),
    );
  }

  saveCurrentCorporateUserStatus(): Observable<any> {
    return this.saveCurrentCorporateUserStatusGQL.mutate({ status: UserStatus.ONLINE, target: { pos: (window as any).widgetInit.appId } });
  }

  getReputationsByTarget(): Observable<ReputationType[]> {
    return this.getReputationsByTargetGQL.fetch({ target: { pos: (window as any).widgetInit.appId } }).pipe(
      map(({ data }: any) => {
        this.reputations.next(data.getReputationsByTarget);
        return data.getReputationsByTarget as any;
      }),
    );
  }

  getCurrentUserQuantitativeWallets(userToken?: string): Observable<WalletType[]> {
    return this.getCurrentUserQuantitativeWalletsGQL.fetch({ ...(userToken ? { userToken } : {}), pagination: { page: 0, limit: 50 } }).pipe(
      switchMap(({ data }: any) => {
        if (data) {
          this.quantitativeWallet.next(data.getCurrentUserQuantitativeWallets.objects);
          return of(data.getCurrentUserQuantitativeWallets.objects);
        }
        return of(null);
      }),
    );
  }

  getUserWalletWithReputations(userToken?: string): Observable<WalletWithReputationDtoType> {
    return this.getUserWalletWithReputationsGQL.fetch({ ...(userToken ? { userToken } : {}) }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.wallet.next(data.getUserWalletWithReputations);
          return data.getUserWalletWithReputations;
        }
      }),
    );
  }

  findLoyaltySettingsByTarget(aggregatorPosId?: string): Observable<LoyaltySettingsType> {
    this.loadingLoyalty.next(true);
    return this.findLoyaltySettingsByTargetGQL.fetch({ target: { pos: aggregatorPosId ? aggregatorPosId : (window as any).widgetInit.appId } }).pipe(
      map(({ data }: any) => {
        this.loadingLoyalty.next(false);
        if (data) {
          if (!aggregatorPosId) {
            this.loyaltySettings.next(data.findLoyaltySettingsByTarget);
          }
          return data.findLoyaltySettingsByTarget;
        }
      }),
    );
  }
}
