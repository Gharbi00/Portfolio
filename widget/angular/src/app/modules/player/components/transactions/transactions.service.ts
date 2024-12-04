import { Injectable } from '@angular/core';
import { map, BehaviorSubject, Observable, takeUntil, Subject } from 'rxjs';

import {
  WalletTypeEnum,
  WalletTransactionType,
  GetWalletTransactionsByAffectedPaginatedGQL,
} from '@sifca-monorepo/widget-generator';
import { IPagination } from '@diktup/frontend/models';

import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  private isLast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingTransactions: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private walletTransactions: BehaviorSubject<WalletTransactionType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  currentUserId: string;
  walletType: WalletTypeEnum;

  get loadingTransactions$(): Observable<boolean> {
    return this.loadingTransactions.asObservable();
  }

  get walletTransactions$(): Observable<WalletTransactionType[]> {
    return this.walletTransactions.asObservable();
  }
  set walletTransactions$(value: any) {
    this.walletTransactions.next(value);
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  constructor(
    private profileService: ProfileService,
    private getWalletTransactionsByAffectedPaginatedGQL: GetWalletTransactionsByAffectedPaginatedGQL,
  ) {
    this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll)).subscribe((currentUser) => {
      this.currentUserId = currentUser?.id;
    })
  }

  getWalletTransactionsByAffectedPaginated(): Observable<WalletTransactionType[]> {
    this.loadingTransactions.next(true);
    return this.getWalletTransactionsByAffectedPaginatedGQL
    .fetch({
      pagination: { page: this.pageIndex, limit: this.pageLimit },
      filter: {
        ...(this.walletType ? { walletType: [this.walletType] } : { walletType: [WalletTypeEnum.QUANTITATIVE] }),
        affected: [{ user: this.currentUserId }],
      },
    })
    .pipe(
      map(({ data }: any) => {
        this.loadingTransactions.next(false);
        this.pagination.next({
          page: this.pageIndex,
          size: this.pageLimit,
          length: data.getWalletTransactionsByAffectedPaginated?.count,
        });
        this.isLast.next(data.getWalletTransactionsByAffectedPaginated.isLast);
        this.walletTransactions.next(data.getWalletTransactionsByAffectedPaginated.objects);
        return data.getWalletTransactionsByAffectedPaginated.objects;
      }),
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
