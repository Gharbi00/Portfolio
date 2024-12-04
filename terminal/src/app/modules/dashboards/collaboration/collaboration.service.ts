import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  AccountsWithStatsType,
  AnalyticsDashboardInput,
  BoardCardType,
  CollaborationAnalyticsProjectsOverviewType,
  CollaborationAnalyticsProjectsStatusType,
  CollaborationAnalyticsStatsType,
  CrmDashboardInput,
  GetCollaborationAnalyticsStatsGQL,
  GetCollaborationProjectsOverviewGQL,
  GetCollaborationProjectsStatusGQL,
  MessageGroupType,
  ProjectType,
  GetProjectsBoardCardsByTargetPaginatedGQL,
  GetProjectsByTargetWithFilterGQL,
  ProjectFilterInput,
  GetAccountsByTargetWithStatsPaginateGQL,
  GetMessageGroupsPaginationGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class CollaborationAnalyticsService {
  projectsPageLimit = 5;
  projectsPageIndex = 0;
  projectPageLimit: number;
  accountsPageLimit = 10;
  accountsPageIndex = 0;
  boardPageIndex = 0;
  boardPageLimit = 5;

  pipe(arg0: any) {
    throw new Error('Method not implemented.');
  }
  private isLastBoard: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastMember: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingStats: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private projects: BehaviorSubject<ProjectType[]> = new BehaviorSubject(null);
  private loadingProjects: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingAccounts: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingProjectsBoard: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingMessageGroups: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingProjectStatus: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private projectsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private projectsBoard: BehaviorSubject<BoardCardType[]> = new BehaviorSubject(null);
  private loadingProjectsOverview: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private accounts: BehaviorSubject<AccountsWithStatsType[]> = new BehaviorSubject(null);
  private messageGroups: BehaviorSubject<MessageGroupType[]> = new BehaviorSubject(null);
  private stats: BehaviorSubject<CollaborationAnalyticsStatsType> = new BehaviorSubject(null);
  private projectsStatus: BehaviorSubject<CollaborationAnalyticsProjectsStatusType> = new BehaviorSubject(null);
  private projectsOverview: BehaviorSubject<CollaborationAnalyticsProjectsOverviewType> = new BehaviorSubject(null);

  get loadingProjectStatus$(): Observable<boolean> {
    return this.loadingProjectStatus.asObservable();
  }

  get stats$(): Observable<CollaborationAnalyticsStatsType> {
    return this.stats.asObservable();
  }

  get messageGroups$(): Observable<MessageGroupType[]> {
    return this.messageGroups.asObservable();
  }

  get accounts$(): Observable<AccountsWithStatsType[]> {
    return this.accounts.asObservable();
  }
  set accounts$(value: any) {
    this.accounts.next(value);
  }

  get projectsBoard$(): Observable<BoardCardType[]> {
    return this.projectsBoard.asObservable();
  }
  set projectsBoard$(value: any) {
    this.projectsBoard.next(value);
  }

  get loadingAccounts$(): Observable<boolean> {
    return this.loadingAccounts.asObservable();
  }

  get loadingStats$(): Observable<boolean> {
    return this.loadingStats.asObservable();
  }

  get loadingMessageGroups$(): Observable<boolean> {
    return this.loadingMessageGroups.asObservable();
  }

  get loadingProjectsOverview$(): Observable<boolean> {
    return this.loadingProjectsOverview.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get projects$(): Observable<ProjectType[]> {
    return this.projects.asObservable();
  }
  set projects$(newValue: any) {
    this.projects.next(newValue);
  }

  get loadingProjects$(): Observable<boolean> {
    return this.loadingProjects.asObservable();
  }

  set stats$(newValue: any) {
    this.stats.next(newValue);
  }

  get projectsOverview$(): Observable<CollaborationAnalyticsProjectsOverviewType> {
    return this.projectsOverview.asObservable();
  }

  set projectsOverview$(newValue: any) {
    this.projectsOverview.next(newValue);
  }

  get projectsStatus$(): Observable<CollaborationAnalyticsProjectsStatusType> {
    return this.projectsStatus.asObservable();
  }

  get loadingProjectsBoard$(): Observable<boolean> {
    return this.loadingProjectsBoard.asObservable();
  }

  get isLastMember$(): Observable<boolean> {
    return this.isLastMember.asObservable();
  }

  get projectsPagination$(): Observable<IPagination> {
    return this.projectsPagination.asObservable();
  }

  get isLastBoard$(): Observable<boolean> {
    return this.isLastBoard.asObservable();
  }

  set projectsStatus$(newValue: any) {
    this.projectsStatus.next(newValue);
  }

  constructor(
    private storageHelper: StorageHelper,
    private getMessageGroupsPaginationGQL: GetMessageGroupsPaginationGQL,
    private getProjectsByTargetWithFilterGQL: GetProjectsByTargetWithFilterGQL,
    private getCollaborationAnalyticsStatsGQL: GetCollaborationAnalyticsStatsGQL,
    private getCollaborationProjectsStatusGQL: GetCollaborationProjectsStatusGQL,
    private getCollaborationProjectsOverviewGQL: GetCollaborationProjectsOverviewGQL,
    private getAccountsByTargetWithStatsPaginateGQL: GetAccountsByTargetWithStatsPaginateGQL,
    private getProjectsBoardCardsByTargetPaginatedGQL: GetProjectsBoardCardsByTargetPaginatedGQL,
  ) {}

  getCollaborationAnalyticsStats(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<CollaborationAnalyticsStatsType> {
    this.loadingStats.next(true);
    return this.getCollaborationAnalyticsStatsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingStats.next(false);
          if (data) {
            this.stats.next(data.getCollaborationAnalyticsStats);
            return data.getCollaborationAnalyticsStats;
          }
        }),
      );
  }

  getCollaborationProjectsOverview(
    input: CrmDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<CollaborationAnalyticsProjectsOverviewType> {
    this.loadingProjectsOverview.next(true);
    return this.getCollaborationProjectsOverviewGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingProjectsOverview.next(false);
          if (data) {
            this.projectsOverview.next(data.getCollaborationProjectsOverview);
            return data.getCollaborationProjectsOverview;
          }
        }),
      );
  }

  getProjectsBoardCardsByTargetPaginated(input: CrmDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<BoardCardType[]> {
    this.loadingProjectsBoard.next(true);
    return this.getProjectsBoardCardsByTargetPaginatedGQL
      .fetch(
        {
          pagination: { page: this.boardPageIndex, limit: this.boardPageLimit },
          filter: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingProjectsBoard.next(false);
          if (data) {
            this.projectsBoard.next([...(this.projectsBoard.value || []), ...data.getProjectsBoardCardsByTargetPaginated.objects]);
            this.isLastBoard.next(data.getProjectsBoardCardsByTargetPaginated.isLast);
            return data.getProjectsBoardCardsByTargetPaginated.objects;
          }
        }),
      );
  }

  getAccountsByTargetWithStatsPaginate(): Observable<AccountsWithStatsType[]> {
    this.loadingAccounts.next(true);
    return this.getAccountsByTargetWithStatsPaginateGQL
      .fetch({
        pagination: { page: this.accountsPageIndex, limit: 3 },
        targets: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingAccounts.next(false);
          if (data) {
            this.pagination.next({
              page: this.accountsPageIndex,
              size: this.accountsPageLimit,
              length: data.getAccountsByTargetWithStatsPaginate?.count,
            });
            this.accounts.next([...(this.accounts.value || []), ...data.getAccountsByTargetWithStatsPaginate.objects]);
            this.isLastMember.next(data.getAccountsByTargetWithStatsPaginate.isLast);
            return data.getAccountsByTargetWithStatsPaginate.objects;
          }
        }),
      );
  }

  getCollaborationProjectsStatus(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<CollaborationAnalyticsProjectsStatusType> {
    this.loadingProjectStatus.next(true);
    return this.getCollaborationProjectsStatusGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingProjectStatus.next(false);
          if (data) {
            this.projectsStatus.next(data.getCollaborationProjectsStatus);
            return data.getCollaborationProjectsStatus;
          }
        }),
      );
  }

  getProjectsByTargetWithFilter(filter: ProjectFilterInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<ProjectType[]> {
    this.loadingProjects.next(true);
    return this.getProjectsByTargetWithFilterGQL
      .fetch(
        {
          pagination: { page: this.projectsPageIndex, limit: this.projectsPageLimit },
          filter: { from: filter?.from, to: filter?.to },
          target: { pos: this.storageHelper.getData('posId') },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingProjects.next(false);
          if (data) {
            this.projectsPagination.next({
              page: this.projectsPageIndex,
              size: this.projectsPageLimit,
              length: data.getProjectsByTargetWithFilter?.count,
            });
            this.projects.next(data.getProjectsByTargetWithFilter.objects);
            return data.getProjectsByTargetWithFilter;
          }
        }),
      );
  }

  getMessageGroupsPagination(): Observable<MessageGroupType[]> {
    this.loadingMessageGroups.next(true);
    return this.getMessageGroupsPaginationGQL
      .fetch({
        pagination: { page: 0, limit: 1 },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingMessageGroups.next(false);
          if (data) {
            this.messageGroups.next(data.getMessageGroupsPagination.objects);
            return data.getMessageGroupsPagination;
          }
        }),
      );
  }
}
