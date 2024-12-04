import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  AnalyticsDashboardInput,
  BoardCardProcedureType,
  CrmAnalyticsBalanceOverviewType,
  CrmAnalyticsDealTypeType,
  CrmAnalyticsSalesForecastType,
  CrmAnalyticsStatsInfoType,
  GetCrmAnalyticsBalanceOverviewGQL,
  GetCrmAnalyticsDealTypeGQL,
  GetCrmAnalyticsSalesForecastGQL,
  GetCrmAnalyticsStatsGQL,
  GetCrmBoardCardProceduresWithFilterGQL,
  GetBoardCardsByCrmBoardWithFilterPaginatedGQL,
  GetBoardCardsByBoardWithFilterPaginatedGQL,
  GetBoardListByBoardGQL,
  CrmDashboardWithTaskFilterInput,
  BoardCardType,
  BoardCardProcedureEnum,
  BoardListType,
  CrmDashboardWithFilterInput,
  BoardCardPriorityEnum,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class CrmAnalyticsService {
  proceduresPageIndex = 0;
  proceduresPageLimit = 10;
  cardsPageLimit = 10;
  cardsPageIndex = 0;
  upcommingPageIndex = 0;
  upcommingPageLimit = 10;
  boardCardsPageIndex = 0;
  boardCardsPageLimit = 10;

  pipe(arg0: any) {
    throw new Error('Method not implemented.');
  }
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingCrmStats: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingBoardCardsByBoard: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastProcedures: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private crmSalesForecast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingBoardCards: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private boardList: BehaviorSubject<BoardListType[]> = new BehaviorSubject(null);
  private boardCards: BehaviorSubject<BoardCardType[]> = new BehaviorSubject(null);
  private boardCardsByBoard: BehaviorSubject<BoardCardType[]> = new BehaviorSubject(null);
  private cardsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private boardCardsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingCardProcedures: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingGetCrmDealType: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private stats: BehaviorSubject<CrmAnalyticsStatsInfoType> = new BehaviorSubject(null);
  private loadingUpcommingActivities: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingCrmBalancedOverview: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private dealType: BehaviorSubject<CrmAnalyticsDealTypeType[]> = new BehaviorSubject(null);
  private upCommingActivitiesPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private salesForecast: BehaviorSubject<CrmAnalyticsSalesForecastType> = new BehaviorSubject(null);
  private upCommingActivities: BehaviorSubject<BoardCardProcedureType[]> = new BehaviorSubject(null);
  private crmBoardCardProcedures: BehaviorSubject<BoardCardProcedureType[]> = new BehaviorSubject(null);
  private balanceOverview: BehaviorSubject<CrmAnalyticsBalanceOverviewType> = new BehaviorSubject(null);

  get stats$(): Observable<CrmAnalyticsStatsInfoType> {
    return this.stats.asObservable();
  }

  get boardList$(): Observable<BoardListType[]> {
    return this.boardList.asObservable();
  }

  get boardCards$(): Observable<BoardCardType[]> {
    return this.boardCards.asObservable();
  }
  set boardCards$(newValue: any) {
    this.boardCards.next(newValue);
  }

  get boardCardsByBoard$(): Observable<BoardCardType[]> {
    return this.boardCardsByBoard.asObservable();
  }
  set boardCardsByBoard$(newValue: any) {
    this.boardCardsByBoard.next(newValue);
  }

  get upCommingActivitiesPagination$(): Observable<IPagination> {
    return this.upCommingActivitiesPagination.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get cardsPagination$(): Observable<IPagination> {
    return this.cardsPagination.asObservable();
  }
  get boardCardsPagination$(): Observable<IPagination> {
    return this.boardCardsPagination.asObservable();
  }

  set stats$(newValue: any) {
    this.stats.next(newValue);
  }

  get salesForecast$(): Observable<CrmAnalyticsSalesForecastType> {
    return this.salesForecast.asObservable();
  }

  get upCommingActivities$(): Observable<BoardCardProcedureType[]> {
    return this.upCommingActivities.asObservable();
  }

  get infiniteCrmBoardCardProcedures$(): Observable<BoardCardProcedureType[]> {
    return this.crmBoardCardProcedures.asObservable();
  }
  set infiniteCrmBoardCardProcedures$(newValue: any) {
    this.crmBoardCardProcedures.next(newValue);
  }

  get loadingCrmStats$(): Observable<boolean> {
    return this.loadingCrmStats.asObservable();
  }
  get loadingBoardCardsByBoard$(): Observable<boolean> {
    return this.loadingBoardCardsByBoard.asObservable();
  }

  get isLastProcedures$(): Observable<boolean> {
    return this.isLastProcedures.asObservable();
  }

  get loadingCardProcedures$(): Observable<boolean> {
    return this.loadingCardProcedures.asObservable();
  }

  get loadingUpcommingActivities$(): Observable<boolean> {
    return this.loadingUpcommingActivities.asObservable();
  }

  get loadingCrmBalancedOverview$(): Observable<boolean> {
    return this.loadingCrmBalancedOverview.asObservable();
  }

  get crmSalesForecast$(): Observable<boolean> {
    return this.crmSalesForecast.asObservable();
  }

  get loadingGetCrmDealType$(): Observable<boolean> {
    return this.loadingGetCrmDealType.asObservable();
  }

  get loadingBoardCards$(): Observable<boolean> {
    return this.loadingBoardCards.asObservable();
  }

  set salesForecast$(newValue: any) {
    this.salesForecast.next(newValue);
  }

  get dealType$(): Observable<CrmAnalyticsDealTypeType[]> {
    return this.dealType.asObservable();
  }

  set dealType$(newValue: any) {
    this.dealType.next(newValue);
  }

  get balanceOverview$(): Observable<CrmAnalyticsBalanceOverviewType> {
    return this.balanceOverview.asObservable();
  }

  set balanceOverview$(newValue: any) {
    this.balanceOverview.next(newValue);
  }

  constructor(
    private storageHelper: StorageHelper,
    private getBoardListByBoardGQL: GetBoardListByBoardGQL,
    private getCrmAnalyticsStatsGQL: GetCrmAnalyticsStatsGQL,
    private getCrmAnalyticsDealTypeGQL: GetCrmAnalyticsDealTypeGQL,
    private getCrmAnalyticsSalesForecastGQL: GetCrmAnalyticsSalesForecastGQL,
    private getCrmAnalyticsBalanceOverviewGQL: GetCrmAnalyticsBalanceOverviewGQL,
    private getCRMBoardCardProceduresWithFilterGQL: GetCrmBoardCardProceduresWithFilterGQL,
    private getBoardCardsByBoardWithFilterPaginatedGQL: GetBoardCardsByBoardWithFilterPaginatedGQL,
    private getBoardCardsByCrmBoardWithFilterPaginatedGQL: GetBoardCardsByCrmBoardWithFilterPaginatedGQL,
  ) {}

  getCrmAnalyticsStats(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<CrmAnalyticsStatsInfoType> {
    this.loadingCrmStats.next(true);
    return this.getCrmAnalyticsStatsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingCrmStats.next(false);
          if (data) {
            this.stats.next(data.getCrmAnalyticsStats);
            return data.getCrmAnalyticsStats;
          }
        }),
      );
  }

  getCrmAnalyticsSalesForecast(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<CrmAnalyticsSalesForecastType> {
    this.crmSalesForecast.next(true);
    return this.getCrmAnalyticsSalesForecastGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.crmSalesForecast.next(false);
          if (data) {
            this.salesForecast.next(data.getCrmAnalyticsSalesForecast);
            return data.getCrmAnalyticsSalesForecast;
          }
        }),
      );
  }

  getCrmAnalyticsDealType(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<CrmAnalyticsDealTypeType[]> {
    this.loadingGetCrmDealType.next(true);
    return this.getCrmAnalyticsDealTypeGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingGetCrmDealType.next(false);
          if (data) {
            this.dealType.next(data.getCrmAnalyticsDealType);
            return data.getCrmAnalyticsDealType;
          }
        }),
      );
  }

  getCrmAnalyticsBalanceOverview(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<CrmAnalyticsBalanceOverviewType> {
    this.loadingCrmBalancedOverview.next(true);
    return this.getCrmAnalyticsBalanceOverviewGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingCrmBalancedOverview.next(false);
          if (data) {
            this.balanceOverview.next(data.getCrmAnalyticsBalanceOverview);
            return data.getCrmAnalyticsBalanceOverview;
          }
        }),
      );
  }

  getBoardCardsByCRMBoardWithFilterPaginated(
    input: CrmDashboardWithFilterInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<BoardCardType[]> {
    this.loadingBoardCards.next(true);
    return this.getBoardCardsByCrmBoardWithFilterPaginatedGQL
      .fetch(
        {
          pagination: { page: this.cardsPageIndex, limit: this.cardsPageLimit },
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') }, status: input?.status },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingBoardCards.next(false);
          if (data) {
            this.cardsPagination.next({
              page: this.cardsPageIndex,
              size: this.cardsPageLimit,
              length: data.getBoardCardsByCRMBoardWithFilterPaginated?.count,
            });
            this.boardCards.next(data.getBoardCardsByCRMBoardWithFilterPaginated.objects);
            return data.getBoardCardsByCRMBoardWithFilterPaginated.objects;
          }
        }),
      );
  }

  getBoardCardsByBoardWithFilterPaginated(board: string, priority?: BoardCardPriorityEnum[]): Observable<BoardCardType[]> {
    this.loadingBoardCardsByBoard.next(true);
    return this.getBoardCardsByBoardWithFilterPaginatedGQL
      .fetch({
        pagination: { page: this.boardCardsPageIndex, limit: this.boardCardsPageLimit },
        board,
        ...(priority?.length ? { filter: { priority } } : {}),
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingBoardCardsByBoard.next(false);
          if (data) {
            this.boardCardsPagination.next({
              page: this.boardCardsPageIndex,
              size: this.boardCardsPageLimit,
              length: data.getBoardCardsByBoardWithFilterPaginated?.count,
            });
            this.boardCardsByBoard.next(data.getBoardCardsByBoardWithFilterPaginated.objects);
            return data.getBoardCardsByBoardWithFilterPaginated.objects;
          }
        }),
      );
  }

  getBoardListByBoard(boardId: string): Observable<BoardListType[]> {
    return this.getBoardListByBoardGQL.fetch({ boardId }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.boardList.next(data.getBoardListByBoard);
          return data.getBoardListByBoard;
        }
      }),
    );
  }

  getCrmBoardCardProceduresWithFilter(
    input: CrmDashboardWithTaskFilterInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<BoardCardProcedureType[]> {
    this.loadingCardProcedures.next(true);
    return this.getCRMBoardCardProceduresWithFilterGQL
      .fetch(
        {
          pagination: { page: this.proceduresPageIndex, limit: this.proceduresPageLimit },
          input: { from: input?.from, to: input?.to, task: input.task || [], target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingCardProcedures.next(false);
          if (data) {
            this.pagination.next({
              page: this.proceduresPageIndex,
              size: this.proceduresPageLimit,
              length: data.getCRMBoardCardProceduresWithFilter?.count,
            });
            this.crmBoardCardProcedures.next([...data.getCRMBoardCardProceduresWithFilter.objects, ...(this.crmBoardCardProcedures.value || [])]);
            this.isLastProcedures.next(data.getCRMBoardCardProceduresWithFilter.isLast);
            return data.getCRMBoardCardProceduresWithFilter.objects;
          }
        }),
      );
  }

  getUpcommingActivities(input: CrmDashboardWithTaskFilterInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<BoardCardProcedureType[]> {
    this.loadingUpcommingActivities.next(true);
    return this.getCRMBoardCardProceduresWithFilterGQL
      .fetch(
        {
          pagination: { page: this.proceduresPageIndex, limit: this.proceduresPageLimit },
          input: {
            from: input?.from,
            to: input?.to,
            task: [BoardCardProcedureEnum.MEETING],
            target: { pos: this.storageHelper.getData('posId') },
          },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingUpcommingActivities.next(false);
          if (data) {
            this.upCommingActivitiesPagination.next({
              page: this.upcommingPageIndex,
              size: this.upcommingPageLimit,
              length: data.getCRMBoardCardProceduresWithFilter?.count,
            });
            this.upCommingActivities.next(data.getCRMBoardCardProceduresWithFilter.objects);
            return data.getCRMBoardCardProceduresWithFilter.objects;
          }
        }),
      );
  }
}
