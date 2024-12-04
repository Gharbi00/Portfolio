import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import {
  ChallengeGQL,
  ChallengeType,
  PerformDonationActivityGQL,
  GetOngoingChallengesByTargetAndUserAudiencePaginatedGQL,
  GetUpcomingChallengesByTargetAndUserAudiencePaginatedGQL,
} from '@sifca-monorepo/widget-generator';
import { IPagination } from '@diktup/frontend/models';

@Injectable({
  providedIn: 'root',
})
export class ChallengeService {
  private leaderboard: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private loadingChallenges: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private loadingLeaderboard: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private challenges: BehaviorSubject<ChallengeType[]> = new BehaviorSubject<ChallengeType[]>(null);
  private leaderboardPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private selectedChallenge: BehaviorSubject<ChallengeType> = new BehaviorSubject<ChallengeType>(null);

  pageLimit = 10;
  isDonation = null;
  pageIndex: number = 0;
  leaderboardPageIndex = 0;
  leaderboardPageLimit = 10;

  get selectedChallenge$(): Observable<ChallengeType> {
    return this.selectedChallenge.asObservable();
  }
  set selectedChallenge$(value: any) {
    this.selectedChallenge.next(value);
  }

  get challenges$(): Observable<ChallengeType[]> {
    return this.challenges.asObservable();
  }
  set challenges$(value: any) {
    this.challenges.next(value);
  }

  get loadingLeaderboard$(): Observable<boolean> {
    return this.loadingLeaderboard.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get leaderboardPagination$(): Observable<IPagination> {
    return this.leaderboardPagination.asObservable();
  }

  get loadingChallenges$(): Observable<boolean> {
    return this.loadingChallenges.asObservable();
  }

  get leaderboard$(): Observable<any> {
    return this.leaderboard.asObservable();
  }

  constructor(
    private challengeGQL: ChallengeGQL,
    private performDonationActivityGQL: PerformDonationActivityGQL,
    private getOngoingChallengesByTargetAndUserAudiencePaginatedGQL: GetOngoingChallengesByTargetAndUserAudiencePaginatedGQL,
    private getUpcomingChallengesByTargetAndUserAudiencePaginatedGQL: GetUpcomingChallengesByTargetAndUserAudiencePaginatedGQL,
  ) {}

  getChallengeById(id: string): Observable<ChallengeType> {
    return this.challengeGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.selectedChallenge.next(data.challenge);
          return data.challenge;
        }
      }),
    );
  }

  performDonationActivity(amount: string, challengeId: string): Observable<ChallengeType[]> {
    return this.performDonationActivityGQL
      .mutate({
        amount,
        challengeId,
      })
      .pipe(
        map(({ data }: any) => {
          return data.performDonationActivity;
        }),
      );
  }

  getOngoingChallengesByTargetAndUserAudiencePaginated(): Observable<ChallengeType[]> {
    this.loadingChallenges.next(true);
    return this.getOngoingChallengesByTargetAndUserAudiencePaginatedGQL
      .fetch({
        filter: {
          ...(this.isDonation === true ?
            { isDonation: true } :
            this.isDonation === false ? { isDonation: false } : {}
          ),

          target: { pos: (window as any).widgetInit.appId },
        },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        catchError(() => {
          this.loadingChallenges.next(false);
          return of(null);
        }),
        map(({ data }: any) => {
          this.loadingChallenges.next(false);
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getOngoingChallengesByTargetAndUserAudiencePaginated?.count,
          });
          this.challenges.next(data.getOngoingChallengesByTargetAndUserAudiencePaginated.objects);
          return data.getOngoingChallengesByTargetAndUserAudiencePaginated.objects;
        }),
      );
  }

  getUpcomingChallengesByTargetAndUserAudiencePaginated(): Observable<ChallengeType[]> {
    this.loadingChallenges.next(true);
    return this.getUpcomingChallengesByTargetAndUserAudiencePaginatedGQL
      .fetch({
        filter: {
          isDonation: this.isDonation,
          target: { pos: (window as any).widgetInit.appId },
        },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        catchError(() => {
          this.loadingChallenges.next(false);
          return of(null);
        }),
        map(({ data }: any) => {
          this.loadingChallenges.next(false);
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getUpcomingChallengesByTargetAndUserAudiencePaginated?.count,
          });
          this.challenges.next(data.getUpcomingChallengesByTargetAndUserAudiencePaginated.objects);
          return data.getUpcomingChallengesByTargetAndUserAudiencePaginated.objects;
        }),
      );
  }
}
