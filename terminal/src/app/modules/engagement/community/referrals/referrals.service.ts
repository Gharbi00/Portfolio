import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ReferralType, GetReferralsByTargetPaginationGQL } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class ReferralsService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingReferrals: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private referralPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private referrals: BehaviorSubject<ReferralType[]> = new BehaviorSubject(null);

  pageLimit = 10;
  pageIndex = 0;

  get loadingReferrals$(): Observable<boolean> {
    return this.loadingReferrals.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get referralPagination$(): Observable<IPagination> {
    return this.referralPagination.asObservable();
  }

  get referrals$(): Observable<ReferralType[]> {
    return this.referrals.asObservable();
  }

  constructor(private storageHelper: StorageHelper, private getReferralsByTargetPaginationGQL: GetReferralsByTargetPaginationGQL) {}

  getReferralsByTargetPagination(): Observable<ReferralType[]> {
    this.loadingReferrals.next(true);
    return this.getReferralsByTargetPaginationGQL
      .fetch({
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingReferrals.next(false);
          if (data) {
            this.referrals.next(data.getReferralsByTargetPagination?.objects);
            this.referralPagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getReferralsByTargetPagination?.count,
            });
            return data.getReferralsByTargetPagination;
          }
        }),
      );
  }
}
