import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap, take, map } from 'rxjs/operators';

import {
  ReputationType,
  SubscriptionStatus,
  LoyaltySettingsType,
  SubscribersFullType,
  UpdateReputationInput,
  UpdateLoyaltySettingsGQL,
  GetReputationsByTargetGQL,
  UpdateTargetReputationGQL,
  LoyaltySettingsUpdateInput,
  SearchTargetSubscribersGQL,
  ApproveLoyaltySubscriptionGQL,
  UpdateReputationLevelPointsGQL,
  SendTargetSubscribersBymailGQL,
  GetTargetSubscribersByExcelGQL,
  GetTargetSubscribersPaginationGQL,
  SubscribersFullWithReputationType,
  SubscribersWithReputationsPaginateType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { MailResponseDto } from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class SubscribersService {
  private loadingSubscribers: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);
  private reputations: BehaviorSubject<ReputationType[] | null> = new BehaviorSubject(null);
  private loyaltySettings: BehaviorSubject<LoyaltySettingsType> = new BehaviorSubject(null);
  private subscribers: BehaviorSubject<SubscribersFullWithReputationType[] | null> = new BehaviorSubject(null);

  status = [];
  pageIndex = 0;
  pageLimit = 10;
  searchString = '';

  constructor(
    private storageHelper: StorageHelper,
    private updateLoyaltySettingsGQL: UpdateLoyaltySettingsGQL,
    private getReputationsByTargetGQL: GetReputationsByTargetGQL,
    private updateTargetReputationGQL: UpdateTargetReputationGQL,
    private searchTargetSubscribersGQL: SearchTargetSubscribersGQL,
    private approveLoyaltySubscriptionGQL: ApproveLoyaltySubscriptionGQL,
    private getTargetSubscribersByExcelGQL: GetTargetSubscribersByExcelGQL,
    private sendTargetSubscribersBymailGQL: SendTargetSubscribersBymailGQL,
    private updateReputationLevelPointsGQL: UpdateReputationLevelPointsGQL,
    private getTargetSubscribersPaginationGQL: GetTargetSubscribersPaginationGQL,
  ) {}

  get loadingSubscribers$(): Observable<boolean> {
    return this.loadingSubscribers.asObservable();
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

  sendTargetSubscribersBymail(emails: string): Observable<MailResponseDto> {
    return this.sendTargetSubscribersBymailGQL
      .fetch({
        statuses: this.status,
        emails,
        subject: 'Your export of subscribers',
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendTargetSubscribersBymail;
          }
        }),
      );
  }

  getTargetSubscribersByExcel(): Observable<InvoicePdfType> {
    return this.getTargetSubscribersByExcelGQL
      .fetch({
        ...(this.status?.length ? { statuses: this.status } : {}),
        target: { pos: this.storageHelper.getData('posId') },
        ...(this.searchString ? { searchString: this.searchString } : {}),
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getTargetSubscribersByExcel.content;
          }
        }),
      );
  }

  searchTargetSubscribers(): Observable<SubscribersWithReputationsPaginateType> {
    this.loadingSubscribers.next(true);
    return this.searchTargetSubscribersGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        statuses: this.status,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.searchTargetSubscribers?.count,
            });
            this.loadingSubscribers.next(false);
            this.subscribers.next(data.searchTargetSubscribers.objects);
            return data.searchTargetSubscribers;
          }
        }),
      );
  }

  getTargetSubscribersPagination(status?: SubscriptionStatus): Observable<SubscribersWithReputationsPaginateType> {
    return this.getTargetSubscribersPaginationGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        status: [SubscriptionStatus.APPROVED, SubscriptionStatus.PENDING, SubscriptionStatus.REJECTED],
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getTargetSubscribersPagination?.count,
            });
            this.subscribers.next(response.data.getTargetSubscribersPagination.objects);
            return response.data.getTargetSubscribersPagination.objects;
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
              this.reputations[index] = data.updateTargetReputation;
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

  updateLoyaltySettings(input: LoyaltySettingsUpdateInput): Observable<LoyaltySettingsType> {
    return this.updateLoyaltySettingsGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          return response.data.updateLoyaltySettings;
        }
      }),
    );
  }
}
