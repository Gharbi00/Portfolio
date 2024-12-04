import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import {
  LeaderboardBaseType,
  LeaderboardCycleEnum,
  GetLiveLeaderboardByCycleForCurrentUserPaginatedGQL,
  GetChallengeLeaderboardWithCurrentUserGQL,
  LeaderboardChallengeWithCurrentUserPaginateType,
} from '@sifca-monorepo/widget-generator';
import { IPagination } from '@diktup/frontend/models';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private loadingLeaderboard: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private currentUser: BehaviorSubject<LeaderboardBaseType> = new BehaviorSubject<LeaderboardBaseType>(null);
  private leaderboard: BehaviorSubject<LeaderboardBaseType[]> = new BehaviorSubject<LeaderboardBaseType[]>(null);

  pageLimit = 10;
  pageIndex: number = 0;
  cycle = LeaderboardCycleEnum.OVERALL;

  get leaderboard$(): Observable<LeaderboardBaseType[]> {
    return this.leaderboard.asObservable();
  }
  set leaderboard$(value: any){
    this.leaderboard.next(value);
  }

  get currentUser$(): Observable<LeaderboardBaseType> {
    return this.currentUser.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get loadingLeaderboard$(): Observable<boolean> {
    return this.loadingLeaderboard.asObservable();
  }

  constructor(
    private getChallengeLeaderboardWithCurrentUserGQL: GetChallengeLeaderboardWithCurrentUserGQL,
    private getLiveLeaderboardByCycleForCurrentUserPaginatedGQL: GetLiveLeaderboardByCycleForCurrentUserPaginatedGQL,
  ) {}

  getChallengeLeaderboardWithCurrentUser(id: string): Observable<LeaderboardChallengeWithCurrentUserPaginateType[]> {
    this.loadingLeaderboard.next(true);
    return this.getChallengeLeaderboardWithCurrentUserGQL
      .fetch({
        id,
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingLeaderboard.next(false);
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getOngoingChallengesByTargetAndUserAudiencePaginated?.count,
          });
          this.currentUser.next(data.getChallengeLeaderboardWithCurrentUser.currentUser);
          this.leaderboard.next(data.getChallengeLeaderboardWithCurrentUser.objects);
          return data.getChallengeLeaderboardWithCurrentUser.objects;
        }),
      );
  }

  getLiveLeaderboardByCycleForCurrentUserPaginated(): Observable<LeaderboardBaseType[]> {
    this.loadingLeaderboard.next(true);
    return this.getLiveLeaderboardByCycleForCurrentUserPaginatedGQL
      .fetch({
        input: {
          cycle: this.cycle,
          target: { pos: (window as any).widgetInit.appId },
        },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        catchError(() => {
          this.loadingLeaderboard.next(false);
          return of(null);
        }),
        map(({ data }: any) => {
          this.loadingLeaderboard.next(false);
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getLiveLeaderboardByCycleForCurrentUserPaginated?.count,
          });
          this.leaderboard.next(data.getLiveLeaderboardByCycleForCurrentUserPaginated.objects);
          this.currentUser.next(data.getLiveLeaderboardByCycleForCurrentUserPaginated.currentUser);
          return data.getLiveLeaderboardByCycleForCurrentUserPaginated.objects;
        }),
      );
  }
}
