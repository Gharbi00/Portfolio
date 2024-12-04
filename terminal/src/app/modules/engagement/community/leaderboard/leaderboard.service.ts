import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MailResponseDto,
  LeaderboardBasePaginatedType,
  SendLiveLeaderboardByCycleBymailGQL,
  GetLiveLeaderboardByCycleByExcelGQL,
  GetLiveLeaderboardByCyclePaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { LeaderboardBaseType, LeaderboardCycleEnum } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private leaderboards: BehaviorSubject<LeaderboardBaseType[]> = new BehaviorSubject(null);
  private loadingLeaderBoard: BehaviorSubject<boolean> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';

  get leaderboards$(): Observable<LeaderboardBaseType[]> {
    return this.leaderboards.asObservable();
  }
  get loadingLeaderBoard$(): Observable<boolean> {
    return this.loadingLeaderBoard.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private getLiveLeaderboardByCycleByExcelGQL: GetLiveLeaderboardByCycleByExcelGQL,
    private sendLiveLeaderboardByCycleBymailGQL: SendLiveLeaderboardByCycleBymailGQL,
    private getLiveLeaderboardByCyclePaginatedGQL: GetLiveLeaderboardByCyclePaginatedGQL,
  ) {}

  sendLiveLeaderboardByCycleBymail(emails: string, cycle?: LeaderboardCycleEnum): Observable<MailResponseDto> {
    return this.sendLiveLeaderboardByCycleBymailGQL
      .fetch({
        emails,
        subject: 'Your export of transactions',
        input: { searchString: this.searchString, cycle, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendLiveLeaderboardByCycleBymail;
          }
        }),
      );
  }

  getLiveLeaderboardByCycleByExcel(cycle?: LeaderboardCycleEnum): Observable<InvoicePdfType> {
    return this.getLiveLeaderboardByCycleByExcelGQL
      .fetch({
        input: { searchString: this.searchString, cycle, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getLiveLeaderboardByCycleByExcel.content;
          }
        }),
      );
  }

  getLiveLeaderboardByCyclePaginated(cycle: LeaderboardCycleEnum): Observable<LeaderboardBasePaginatedType> {
    this.loadingLeaderBoard.next(true);
    return this.getLiveLeaderboardByCyclePaginatedGQL
      .fetch({
        input: { searchString: this.searchString, cycle, target: { pos: this.storageHelper.getData('posId') } },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingLeaderBoard.next(false);
            this.leaderboards.next(data.getLiveLeaderboardByCyclePaginated.objects);
            this.pagination.next({
              length: data.getLiveLeaderboardByCyclePaginated.count,
              size: this.pageLimit,
              page: this.pageIndex,
            });
            return data.getLiveLeaderboardByCyclePaginated.objects;
          }
        }),
      );
  }
}
