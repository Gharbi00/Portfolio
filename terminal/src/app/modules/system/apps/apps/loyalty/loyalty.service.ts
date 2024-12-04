import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap, take, map } from 'rxjs/operators';

import {
  CoinType,
  CoinInput,
  WalletType,
  WalletInput,
  CreateCoinGQL,
  UpdateCoinGQL,
  ReputationType,
  PointOfSaleType,
  CreateWalletGQL,
  LoyaltySettingsType,
  SubscribersFullType,
  UpdateReputationInput,
  UpdateLoyaltySettingsGQL,
  GetReputationsByTargetGQL,
  UpdateTargetReputationGQL,
  LoyaltySettingsUpdateInput,
  SearchTargetSubscribersGQL,
  ApproveLoyaltySubscriptionGQL,
  FindLoyaltySettingsByTargetGQL,
  UpdateReputationLevelPointsGQL,
  SubscribersFullWithReputationType,
  SubscribersWithReputationsPaginateType,
  GetPointOfSalesAggregatorPaginationGQL,
  QuantitativeWalletsByOwnerPaginationGQL,
  AddReputationLevelGQL,
  AddReputationInput,
  RemoveReputationLevelGQL,
  UpdateReputationLevelGoalStatusGQL,
} from '@sifca-monorepo/terminal-generator';
import { FetchPolicy } from '@apollo/client/core';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { isBoolean } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class LoyaltyService {
  private coin: BehaviorSubject<CoinType> = new BehaviorSubject(null);
  private wallet: BehaviorSubject<WalletType[]> = new BehaviorSubject(null);
  private targets: BehaviorSubject<PointOfSaleType[]> = new BehaviorSubject(null);
  private isLastWallet: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastTarget: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private walletPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private reputations: BehaviorSubject<ReputationType[]> = new BehaviorSubject(null);
  private loyaltySettings: BehaviorSubject<LoyaltySettingsType> = new BehaviorSubject(null);
  private subscribers: BehaviorSubject<SubscribersFullWithReputationType[] | null> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';
  targetPageIndex = 0;
  walletPageIndex = 0;
  walletPageLimit = 10;
  walletSearchString = '';

  constructor(
    private createCoinGQL: CreateCoinGQL,
    private updateCoinGQL: UpdateCoinGQL,
    private storageHelper: StorageHelper,
    private createWalletGQL: CreateWalletGQL,
    private addReputationLevelGQL: AddReputationLevelGQL,
    private removeReputationLevelGQL: RemoveReputationLevelGQL,
    private updateLoyaltySettingsGQL: UpdateLoyaltySettingsGQL,
    private getReputationsByTargetGQL: GetReputationsByTargetGQL,
    private updateTargetReputationGQL: UpdateTargetReputationGQL,
    private searchTargetSubscribersGQL: SearchTargetSubscribersGQL,
    private approveLoyaltySubscriptionGQL: ApproveLoyaltySubscriptionGQL,
    private updateReputationLevelPointsGQL: UpdateReputationLevelPointsGQL,
    private findLoyaltySettingsByTargetGQL: FindLoyaltySettingsByTargetGQL,
    private updateReputationLevelGoalStatusGQL: UpdateReputationLevelGoalStatusGQL,
    private getPointOfSalesAggregatorPaginationGQL: GetPointOfSalesAggregatorPaginationGQL,
    private quantitativeWalletsByOwnerPaginationGQL: QuantitativeWalletsByOwnerPaginationGQL,
  ) {}

  get coin$(): Observable<CoinType> {
    return this.coin.asObservable();
  }
  get isLastWallet$(): Observable<boolean> {
    return this.isLastWallet.asObservable();
  }
  get isLastTarget$(): Observable<boolean> {
    return this.isLastTarget.asObservable();
  }
  get loyaltySettings$(): Observable<LoyaltySettingsType> {
    return this.loyaltySettings.asObservable();
  }
  get subscribers$(): Observable<SubscribersFullWithReputationType[]> {
    return this.subscribers.asObservable();
  }
  get reputations$(): Observable<ReputationType[]> {
    return this.reputations.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get walletPagination$(): Observable<IPagination> {
    return this.walletPagination.asObservable();
  }

  get targets$(): Observable<PointOfSaleType[]> {
    return this.targets.asObservable();
  }

  get wallet$(): Observable<WalletType[]> {
    return this.wallet.asObservable();
  }
  set wallet$(value: any) {
    this.wallet.next(value);
  }

  addReputationLevel(input: AddReputationInput): Observable<PointOfSaleType[]> {
    return this.addReputationLevelGQL
      .mutate({
        input: {
          ...input,
          target: { pos: this.storageHelper.getData('posId') },
        },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.reputations.next([...(this.reputations.value || []), ...data.addReputationLevel]);
            return data.addReputationLevel;
          }
        }),
      );
  }

  getReputationsByTarget(): Observable<ReputationType[]> {
    return this.getReputationsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.reputations.next(data.getReputationsByTarget);
          return data.getReputationsByTarget;
        }
      }),
    );
  }

  updateReputationLevelGoalStatus(input: any): Observable<PointOfSaleType[]> {
    return this.reputations$.pipe(
      take(1),
      switchMap((reputations) =>
        this.updateReputationLevelGoalStatusGQL
          .mutate({
            id: input.id,
            ...(isBoolean(input.turnoverGoalEnabled) ? {turnoverGoalEnabled: input.turnoverGoalEnabled} : {}),
            ...(isBoolean(input.frequencyGoalEnabled) ? {frequencyGoalEnabled: input.frequencyGoalEnabled} : {}),
          })
          .pipe(
            map(({ data }: any) => {
              if (data) {
                const index = reputations.findIndex((item) => item.id === input.id);
                reputations[index] = data.updateReputationLevelGoalStatus;
                this.reputations.next(reputations);
                return data.updateReputationLevelGoalStatus;
              }
            }),
          ),
      ),
    );
  }

  removeReputationLevel(id: string): Observable<PointOfSaleType[]> {
    return this.removeReputationLevelGQL
      .mutate({
        id,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            const reputations = this.reputations.value.filter((item) => item.id !== id);
            this.reputations.next(reputations);
            return data.removeReputationLevel;
          }
        }),
      );
  }

  getPointOfSalesAggregatorPagination(): Observable<PointOfSaleType[]> {
    return this.getPointOfSalesAggregatorPaginationGQL
      .fetch({
        pagination: { page: this.targetPageIndex, limit: this.walletPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.targets.next([...data.getPointOfSalesAggregatorPagination.objects, ...(this.targets.value || [])]);
            this.isLastTarget.next(data.getPointOfSalesAggregatorPagination.isLast);
            return data.getPointOfSalesAggregatorPagination.objects;
          }
        }),
      );
  }

  quantitativeWalletsByOwnerPagination(advertiserId?: string): Observable<WalletType[]> {
    return this.quantitativeWalletsByOwnerPaginationGQL
      .fetch({
        // ...this.walletSearchString ? {searchString: this.walletSearchString} : {},
        target: { pos: advertiserId ? advertiserId : this.storageHelper.getData('posId') },
        pagination: { page: this.walletPageIndex, limit: this.walletPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.wallet.next([...data.quantitativeWalletsByOwnerPagination.objects, ...(this.wallet.value || [])]);
            this.isLastWallet.next(data.quantitativeWalletsByOwnerPagination.isLast);
            this.walletPagination.next({
              page: this.walletPageIndex,
              size: this.walletPageLimit,
              length: data.quantitativeWalletsByOwnerPagination?.count,
            });
            return data.quantitativeWalletsByOwnerPagination.objects;
          }
        }),
      );
  }

  createWallet(input: WalletInput): Observable<WalletType> {
    return this.createWalletGQL
      .mutate({
        input: { ...input, owner: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.wallet.next([data.createWallet, ...(this.wallet.value || [])]);
            return data.createWallet;
          }
        }),
      );
  }

  findLoyaltySettingsByTarget(fetchPolicy: FetchPolicy = 'cache-first'): Observable<LoyaltySettingsType> {
    return this.findLoyaltySettingsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loyaltySettings.next(data.findLoyaltySettingsByTarget);
          return data.findLoyaltySettingsByTarget;
        }
      }),
    );
  }

  getLoyaltySettingsByTarget(): Observable<LoyaltySettingsType> {
    return this.findLoyaltySettingsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loyaltySettings.next(data.findLoyaltySettingsByTarget);
          return data.findLoyaltySettingsByTarget;
        }
      }),
    );
  }

  getLoyaltySettings(pos: string): Observable<LoyaltySettingsType> {
    return this.findLoyaltySettingsByTargetGQL.fetch({ target: { pos } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.findLoyaltySettingsByTarget;
        }
      }),
    );
  }

  updateCoin(id: string, input: CoinInput): Observable<CoinType> {
    return this.updateCoinGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.coin.next(data.updateCoin);
          this.loyaltySettings.next({
            ...this.loyaltySettings.value,
            quantitative: {
              ...this.loyaltySettings.value.quantitative,
              coin: data.updateCoin,
            },
          });
          return data.updateCoin;
        }
      }),
    );
  }

  createCoin(input: CoinInput): Observable<CoinType> {
    return this.createCoinGQL.mutate({ input: { ...input, owner: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.createCoin;
        }
      }),
    );
  }

  searchTargetSubscribers(): Observable<SubscribersWithReputationsPaginateType> {
    return this.searchTargetSubscribersGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.searchTargetSubscribers?.count,
            });
            this.subscribers.next(data.searchTargetSubscribers.objects);
            return data.searchTargetSubscribers;
          }
        }),
      );
  }

  approveLoyaltySubscription(id: string): Observable<SubscribersFullType> {
    return this.approveLoyaltySubscriptionGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.approveLoyaltySubscription;
        }
      }),
    );
  }

  updateTargetReputation(input: UpdateReputationInput, id: string): Observable<LoyaltySettingsType[]> {
    return this.reputations$.pipe(
      take(1),
      switchMap((reputations) =>
        this.updateTargetReputationGQL.mutate({ input }).pipe(
          map(({ data }: any) => {
            if (data) {
              const index = reputations.findIndex((item) => item.id === id);
              reputations[index] = data.updateTargetReputation;
              this.reputations.next(reputations);
              return data.updateTargetReputation;
            }
          }),
        ),
      ),
    );
  }

  updateReputationLevelPoints(points: number, id: string): Observable<ReputationType[]> {
    return this.updateReputationLevelPointsGQL.mutate({ points, id }).pipe(
      tap((response: any) => {
        if (response.data) {
          return response.data.updateReputationLevelPoints;
        }
      }),
    );
  }

  updateLoyaltySettings(input: LoyaltySettingsUpdateInput, reset = true): Observable<LoyaltySettingsType> {
    return this.updateLoyaltySettingsGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (reset) {
            this.loyaltySettings.next(data.updateLoyaltySettings);
          }
          return data.updateLoyaltySettings;
        }
      }),
    );
  }
}
