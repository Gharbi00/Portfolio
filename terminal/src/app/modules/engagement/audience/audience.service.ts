import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { IPagination } from '@diktup/frontend/models';
import {} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import {
  AudienceGQL,
  AudienceType,
  AudienceInput,
  InvoicePdfType,
  MailResponseDto,
  KeyValueListType,
  AudienceReachType,
  CreateAudienceGQL,
  DeleteAudienceGQL,
  UpdateAudienceGQL,
  ProjectFilterInput,
  ProjectPaginateType,
  DefaultAudienceType,
  GetAudienceReachGQL,
  AudienceCriteriaType,
  SendProjectsBymailGQL,
  GetProjectsByExcelGQL,
  GetProjectsByTargetGQL,
  RefreshAudienceViewsGQL,
  GetDefaultAudiencesPaginatedGQL,
  GetAudienceCriteriasPaginatedGQL,
  GetAudiencesByTargetPaginatedGQL,
  AssignDefaultAudienceToTargetGQL,
} from '@sifca-monorepo/terminal-generator';
import { findIndex } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class AudiencesService {
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingReach: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private criteriasPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private isLastCriterias: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingAudiences: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private audience: BehaviorSubject<AudienceType> = new BehaviorSubject<AudienceType>(null);
  private audiences: BehaviorSubject<AudienceType[]> = new BehaviorSubject<AudienceType[]>(null);
  private infiniteAudiences: BehaviorSubject<AudienceType[]> = new BehaviorSubject<AudienceType[]>(null);
  private brandColors: BehaviorSubject<KeyValueListType[]> = new BehaviorSubject<KeyValueListType[]>(null);
  private defaultAudience: BehaviorSubject<DefaultAudienceType[]> = new BehaviorSubject<DefaultAudienceType[]>(null);
  private infinteCriterias: BehaviorSubject<AudienceCriteriaType[]> = new BehaviorSubject<AudienceCriteriaType[]>(null);

  pageIndex = 0;
  filterLimit = 12;
  searchString = '';
  criteriasPageIndex = 0;
  criteriasPageLimit = 10;
  criteriaSearchString = '';
  defaultAudiencePageIndex = 0;
  defaultAudienceSearchString = '';

  get loadingAudiences$(): Observable<boolean> {
    return this.loadingAudiences.asObservable();
  }
  get defaultAudiences$(): Observable<DefaultAudienceType[]> {
    return this.defaultAudience.asObservable();
  }
  get audiences$(): Observable<AudienceType[]> {
    return this.audiences.asObservable();
  }
  get audience$(): Observable<AudienceType> {
    return this.audience.asObservable();
  }
  set audience$(value: any) {
    this.audience.next(value);
  }
  get infiniteAudiences$(): Observable<AudienceType[]> {
    return this.infiniteAudiences.asObservable();
  }
  set infiniteAudiences$(value: any) {
    this.infiniteAudiences.next(value);
  }
  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }
  get brandColors$(): Observable<KeyValueListType[]> {
    return this.brandColors.asObservable();
  }
  get isLastCriterias$(): Observable<boolean> {
    return this.isLastCriterias.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get infinteCriterias$(): Observable<AudienceCriteriaType[]> {
    return this.infinteCriterias.asObservable();
  }
  set infinteCriterias$(value: any) {
    this.infinteCriterias.next(value);
  }
  get loadingReach$(): Observable<boolean> {
    return this.loadingReach.asObservable();
  }
  set loadingReach$(value: any) {
    this.loadingReach.next(value);
  }

  constructor(
    private audienceGQL: AudienceGQL,
    private storageHelper: StorageHelper,
    private deleteAudienceGQL: DeleteAudienceGQL,
    private createAudienceGQL: CreateAudienceGQL,
    private updateAudienceGQL: UpdateAudienceGQL,
    private getAudienceReachGQL: GetAudienceReachGQL,
    private getAudiencesByExcelGQL: GetProjectsByExcelGQL,
    private sendAudiencesBymailGQL: SendProjectsBymailGQL,
    private getAudiencesByTargetGQL: GetProjectsByTargetGQL,
    private refreshAudienceViewsGQL: RefreshAudienceViewsGQL,
    private assignDefaultAudienceToTargetGQL: AssignDefaultAudienceToTargetGQL,
    private getDefaultAudiencesPaginatedGQL: GetDefaultAudiencesPaginatedGQL,
    private getAudienceCriteriasPaginatedGQL: GetAudienceCriteriasPaginatedGQL,
    private getAudiencesByTargetPaginatedGQL: GetAudiencesByTargetPaginatedGQL,
  ) {}

  assignAudienceToTarget(id: string): Observable<AudienceType> {
    return this.assignDefaultAudienceToTargetGQL.mutate({ id, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.audiences.next([data.assignDefaultAudienceToTarget, ...this.audiences.value]);
          return data.assignDefaultAudienceToTarget;
        }
      }),
    );
  }

  getDefaultAudiencesPaginated(): Observable<DefaultAudienceType[]> {
    return this.getDefaultAudiencesPaginatedGQL
      .fetch({ searchString: this.defaultAudienceSearchString, pagination: { page: this.defaultAudiencePageIndex, limit: this.pageIndex } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.defaultAudience.next(data.getDefaultAudiencesPaginated.objects);
            return data.getDefaultAudiencesPaginated;
          }
        }),
      );
  }

  getAudienceById(id: string): Observable<AudienceType> {
    return this.audienceGQL.fetch({ id }).pipe(
      map((response: any) => {
        if (response.data) {
          this.audience.next(response.data.audience);
          return response.data.audience;
        }
      }),
    );
  }

  refreshAudienceViews(id: string): Observable<AudienceReachType> {
    return this.refreshAudienceViewsGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (this.audiences.value.length) {
            const index = findIndex(this.audiences.value, (audience) => audience.id === id);
            this.audiences.value[index].reach.reach = data.refreshAudienceViews.reach;
            this.audiences.value[index].reach.total = data.refreshAudienceViews.total;
            this.audiences.next(this.audiences.value);
          }
          this.audience.next(data.audience);
          return data.refreshAudienceViews;
        }
      }),
    );
  }

  getAudienceReach(input): Observable<AudienceReachType> {
    this.loadingReach.next(true);
    return this.getAudienceReachGQL
      .fetch({
        segments: input?.segments,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        catchError(() => {
          this.loadingReach.next(false);
          return of(null);
        }),
        map(({ data }: any) => {
          this.loadingReach.next(false);
          if (data) {
            return data.getAudienceReach;
          }
        }),
      );
  }

  getAudienceCriteriasPaginated(): Observable<AudienceCriteriaType[]> {
    return this.getAudienceCriteriasPaginatedGQL
      .fetch({ pagination: { page: this.criteriasPageIndex, limit: this.criteriasPageLimit }, searchString: this.criteriaSearchString })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.criteriasPagination.next({
              page: this.criteriasPageIndex,
              size: this.criteriasPageLimit,
              length: data.getAudienceCriteriasPaginated?.count,
            });
            this.isLastCriterias.next(data.getAudienceCriteriasPaginated?.isLast);
            this.infinteCriterias.next([...(this.infinteCriterias.value || []), ...data.getAudienceCriteriasPaginated.objects]);
            return data.getAudienceCriteriasPaginated.objects;
          }
        }),
      );
  }

  createAudience(input: AudienceInput): Observable<AudienceType> {
    return this.createAudienceGQL
      .mutate({
        input: {
          ...input,
          ...(input?.target?.pos
            ? { target: input.target }
            : {
                target: { pos: this.storageHelper.getData('posId') },
              }),
        },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.audiences.next([response.data.createAudience, ...(this.audiences.value || [])]);
            return response.data.createAudience;
          }
        }),
      );
  }

  updateAudience(id: string, input: AudienceInput): Observable<AudienceType> {
    return this.updateAudienceGQL.mutate({ input, id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.audience.next(data.updateAudience);
          return data.updateAudience;
        }
      }),
    );
  }

  deleteAudience(id: string): Observable<AudienceType> {
    return this.deleteAudienceGQL.mutate({ id }).pipe(
      map((response: any) => {
        if (response.data) {
          const index = this.audiences.value.findIndex((item) => item.id === id);
          this.audiences.value.splice(index, 1);
          this.audiences.next(this.audiences.value);
          return response.data.deleteAudience;
        }
      }),
    );
  }

  getAudiencesByExcel(filter?: ProjectFilterInput): Observable<InvoicePdfType> {
    return this.getAudiencesByExcelGQL
      .fetch({
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getAudiencesByExcel.content;
          }
        }),
      );
  }

  sendAudiencesBymail(emails: string, filter?: ProjectFilterInput): Observable<MailResponseDto> {
    return this.sendAudiencesBymailGQL
      .fetch({
        emails,
        subject: 'Your export of audiences',
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          return data.sendTicketsBymail;
        }),
      );
  }

  getAudiencesByTargetPaginated(loaded = false, filter?: any): Observable<AudienceType[]> {
    if (!loaded) {
      this.loadingAudiences.next(true);
    }
    return this.getAudiencesByTargetPaginatedGQL
      .fetch({
        ...(filter?.questType ? { questType: filter?.questType } : {}),
        ...(filter?.advertiser?.pos ? { advertiser: filter?.advertiser } : {}),
        ...(filter?.target?.pos
          ? { target: filter.target }
          : {
              target: { pos: this.storageHelper.getData('posId') },
            }),
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: response.data.getAudiencesByTargetPaginated.count,
            });
            this.loadingAudiences.next(false);
            this.infiniteAudiences.next([...(this.infiniteAudiences.value || []), ...response.data.getAudiencesByTargetPaginated.objects]);
            this.audiences.next(response.data.getAudiencesByTargetPaginated.objects);
            this.isLast.next(response.data.getAudiencesByTargetPaginated.isLast);
            return response.data.getAudiencesByTargetPaginated.objects;
          }
        }),
      );
  }

  getAudiencesByTarget(): Observable<ProjectPaginateType> {
    return this.getAudiencesByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.audiences.next(response.data.getProjectsByTarget);
          return response.data.getProjectsByTarget;
        }
      }),
    );
  }
}
