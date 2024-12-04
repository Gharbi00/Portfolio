import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  ChallengeFilterInput,
  ChallengeInput,
  BarcodeWithPublicPriceFullType,
  ChallengeType,
  LeaderboardChallengeType,
  ProductVarietyEnum,
  CreateChallengeGQL,
  UpdateChallengeGQL,
  ChallengeGQL,
  DeleteChallengeGQL,
  GetChallengeLeaderboardGQL,
  GetChallengesByTargetWithDonationProgressPaginatedGQL,
  RemoveAudienceFromChallengeGQL,
  GetBarcodesWithVarietyAndStructureWithFilterGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class ChallengesService {
  private isLastBarcode: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private challenge: BehaviorSubject<ChallengeType> = new BehaviorSubject(null);
  private loadingChallenge: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingChallenges: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private challenges: BehaviorSubject<ChallengeType[]> = new BehaviorSubject(null);
  private isLastChallenges: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private infiniteChallenges: BehaviorSubject<ChallengeType[]> = new BehaviorSubject(null);
  private loadingLeaderboard: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private leaderboard: BehaviorSubject<LeaderboardChallengeType[]> = new BehaviorSubject(null);
  private infinitBarcodes: BehaviorSubject<BarcodeWithPublicPriceFullType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';
  barcodePageIndex = 0;
  leaderboardPageIndex = 0;
  challengeSearchString = '';

  get isLastChallenges$(): Observable<boolean> {
    return this.isLastChallenges.asObservable();
  }

  get challenge$(): Observable<ChallengeType> {
    return this.challenge.asObservable();
  }

  get infiniteChallenges$(): Observable<ChallengeType[]> {
    return this.infiniteChallenges.asObservable();
  }
  set infiniteChallenges$(value: any) {
    this.infiniteChallenges.next(value);
  }

  get loadingLeaderboard$(): Observable<boolean> {
    return this.loadingLeaderboard.asObservable();
  }

  get leaderboard$(): Observable<LeaderboardChallengeType[]> {
    return this.leaderboard.asObservable();
  }

  get isLastBarcode$(): Observable<boolean> {
    return this.isLastBarcode.asObservable();
  }

  get infinitBarcodes$(): Observable<BarcodeWithPublicPriceFullType[]> {
    return this.infinitBarcodes.asObservable();
  }
  set infinitBarcodes$(value: any) {
    this.infinitBarcodes.next(value);
  }

  get challenges$(): Observable<ChallengeType[]> {
    return this.challenges.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get loadingChallenges$(): Observable<boolean> {
    return this.loadingChallenges.asObservable();
  }
  get loadingChallenge$(): Observable<boolean> {
    return this.loadingChallenge.asObservable();
  }

  constructor(
    private challengeGQL: ChallengeGQL,
    private storageHelper: StorageHelper,
    private createChallengeGQL: CreateChallengeGQL,
    private deleteChallengeGQL: DeleteChallengeGQL,
    private updateChallengeGQL: UpdateChallengeGQL,
    private getChallengeLeaderboardGQL: GetChallengeLeaderboardGQL,
    private removeAudienceFromChallengeGQL: RemoveAudienceFromChallengeGQL,
    private getBarcodesWithVarietyAndStructureWithFilterGQL: GetBarcodesWithVarietyAndStructureWithFilterGQL,
    private getChallengesByTargetWithDonationProgressPaginatedGQL: GetChallengesByTargetWithDonationProgressPaginatedGQL,
  ) {}

  getChallengesByTargetWithDonationProgressPaginated(filter?: ChallengeFilterInput): Observable<ChallengeType[]> {
    this.loadingChallenges.next(true);
    return this.getChallengesByTargetWithDonationProgressPaginatedGQL
      .fetch({
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        searchString: this.challengeSearchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getChallengesByTargetWithDonationProgressPaginated?.count,
            });
            this.loadingChallenges.next(false);
            this.infiniteChallenges.next([...(this.infiniteChallenges.value || []), ...data.getChallengesByTargetWithDonationProgressPaginated.objects]);
            this.challenges.next(data.getChallengesByTargetWithDonationProgressPaginated.objects);
            this.isLastChallenges.next(data.getChallengesByTargetWithDonationProgressPaginated.isLast);
            return data.getChallengesByTargetWithDonationProgressPaginated.objects;
          }
        }),
      );
  }

  createChallenge(input: ChallengeInput): Observable<ChallengeType> {
    return this.createChallengeGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.challenges.next([data.createChallenge, ...(this.challenges.value || [])]);
          return data.createChallenge;
        }
      }),
    );
  }

  updateChallenge(id: string, input: ChallengeInput): Observable<ChallengeType> {
    return this.updateChallengeGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const challenges = this.challenges.value;
          if (challenges?.length) {
            const index = this.challenges.value?.findIndex((a) => a.id === id);
            challenges[index] = data.updateChallenge;
            this.challenges.next(challenges);
          }
          this.challenge.next(data.updateChallenge);
          return data.updateChallenge;
        }
      }),
    );
  }

  deleteChallenge(id: string): Observable<boolean> {
    return this.deleteChallengeGQL.mutate({ id }).pipe(
      map((response: any) => {
        if (response.data.deleteChallenge) {
          const challenges = this.challenges.value.filter((item) => item.id !== id);
          this.challenges.next(challenges);
          return true;
        }
        return false;
      }),
    );
  }

  removeAudienceFromChallenge(id: string): Observable<ChallengeType> {
    return this.removeAudienceFromChallengeGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.challenge.next(data.removeAudienceFromChallenge);
          return data.removeAudienceFromChallenge;
        }
      }),
    );
  }

  getBarcodesWithVarietyAndStructureWithFilter(): Observable<BarcodeWithPublicPriceFullType[]> {
    return this.getBarcodesWithVarietyAndStructureWithFilterGQL
      .fetch({
        filter: { variety: [ProductVarietyEnum.PRODUCT], searchString: this.searchString },
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.barcodePageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.isLastBarcode.next(data.getBarcodesWithVarietyAndStructureWithFilter.isLast);
          this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.getBarcodesWithVarietyAndStructureWithFilter.objects]);
          return data.getBarcodesWithVarietyAndStructureWithFilter;
        }),
      );
  }

  getChallengeById(id: string): Observable<ChallengeType> {
    this.loadingChallenge.next(true);
    return this.challengeGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingChallenge.next(false);
          this.challenge.next(data.challenge);
          return data.challenge;
        }
      }),
    );
  }

  getChallengeLeaderboard(id: string): Observable<LeaderboardChallengeType[]> {
    this.loadingLeaderboard.next(true);
    return this.getChallengeLeaderboardGQL
      .fetch({
        id,
        pagination: { page: this.leaderboardPageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingLeaderboard.next(false);
          this.leaderboard.next(data.getChallengeLeaderboard.objects);
          this.pagination.next({
            page: this.leaderboardPageIndex,
            size: this.pageLimit,
            length: data.getChallengeLeaderboard?.count,
          });
          return data.getChallengeLeaderboard;
        }),
      );
  }
}
