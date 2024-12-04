import { findIndex } from 'lodash';
import subYears from 'date-fns/subYears';
import { Injectable } from '@angular/core';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import { FetchPolicy } from '@apollo/client/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, delay, map, switchMap, tap } from 'rxjs/operators';

import { Wallets } from './data';
import { WalletModel } from './wallet.model';
import { SortColumn, SortDirection } from './wallet-sortable.directive';
import {
  CoinType,
  WalletTopupType,
  CoinCategoryEnum,
  WalletTopupInput,
  UpdateWalletTopupGQL,
  CreateWalletTopupGQL,
  WalletTransactionType,
  WalletTopupCurrencyType,
  GetWalletTopupsValueGQL,
  WalletTransactionsStatsType,
  GetCoinsByCountryPaginatedGQL,
  GetCoinsByCategoryPaginatedGQL,
  WalletTransactionsStatsChartType,
  GetWalletTopupsByTargetPaginatedGQL,
  GetWalletTransactionsStatsByAffectedGQL,
  WalletTransactionsStatsChartFilterInput,
  GetWalletTransactionsByAffectedPaginatedGQL,
  GetWalletTransactionsStatsChartWithFilterGQL,
  GetWalletTransactionsByAffectedPaginatedByExcelGQL,
  WalletTransactionsByAffectedFilterInput,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

interface SearchResult {
  countries: WalletModel[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
}

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

function sort(countries: WalletModel[], column: SortColumn, direction: string): WalletModel[] {
  if (direction === '' || column === '') {
    return countries;
  } else {
    return [...countries].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(country: WalletModel, term: string) {
  return (
    country.coinName.toLowerCase().includes(term.toLowerCase()) ||
    country.quantity.toLowerCase().includes(term.toLowerCase()) ||
    country.avgPrice.toLowerCase().includes(term.toLowerCase()) ||
    country.value.toLowerCase().includes(term.toLowerCase()) ||
    country.returns.toLowerCase().includes(term.toLowerCase()) ||
    country.icon.toLowerCase().includes(term.toLowerCase()) ||
    country.percentage.toLowerCase().includes(term.toLowerCase())
  );
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private selectedField: BehaviorSubject<string> = new BehaviorSubject('country');
  private selectedCategoryField: BehaviorSubject<string> = new BehaviorSubject('overall');
  private coins: BehaviorSubject<CoinType[]> = new BehaviorSubject([]);
  private stats: BehaviorSubject<WalletTransactionsStatsType> = new BehaviorSubject(null);
  private loadingCoins: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingStats: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private topupPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private transactionPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private transactions: BehaviorSubject<WalletTransactionType[]> = new BehaviorSubject(null);
  private walletTopup: BehaviorSubject<WalletTopupType[]> = new BehaviorSubject(null);
  private walletChart: BehaviorSubject<WalletTransactionsStatsChartType> = new BehaviorSubject(null);
  private loadingWalletChart: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingTopups: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingTransactions: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private dateFilter: BehaviorSubject<any> = new BehaviorSubject({
    from: subYears(startOfToday(), 20),
    to: endOfToday(),
  });

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _countries$ = new BehaviorSubject<WalletModel[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0,
  };
  pageIndex = 0;
  pageLimit = 5;
  transactionPageIndex = 0;
  transactionPageLimit = 6;
  to = endOfToday();
  from = subYears(startOfToday(), 20);

  get countries$() {
    return this._countries$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }
  get startIndex() {
    return this._state.startIndex;
  }
  get endIndex() {
    return this._state.endIndex;
  }
  get totalRecords() {
    return this._state.totalRecords;
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }
  set startIndex(startIndex: number) {
    this._set({ startIndex });
  }
  set endIndex(endIndex: number) {
    this._set({ endIndex });
  }
  set totalRecords(totalRecords: number) {
    this._set({ totalRecords });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, page, searchTerm } = this._state;

    // 1. sort
    let countries = sort(Wallets, sortColumn, sortDirection);

    // 2. filter
    countries = countries.filter((country) => matches(country, searchTerm));
    const total = countries.length;

    // 3. paginate
    this.totalRecords = countries.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    countries = countries.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({ countries, total });
  }

  get dateFilter$(): Observable<any> {
    return this.dateFilter.asObservable();
  }
  set dateFilter$(value: any) {
    this.dateFilter.next(value);
  }

  get loadingWalletChart$(): Observable<boolean> {
    return this.loadingWalletChart.asObservable();
  }
  set loadingWalletChart$(value: any) {
    this.loadingWalletChart.next(value);
  }

  get walletChart$(): Observable<WalletTransactionsStatsChartType> {
    return this.walletChart.asObservable();
  }

  get stats$(): Observable<WalletTransactionsStatsType> {
    return this.stats.asObservable();
  }

  get loadingStats$(): Observable<boolean> {
    return this.loadingStats.asObservable();
  }

  get selectedCategoryField$(): Observable<string> {
    return this.selectedCategoryField.asObservable();
  }
  set selectedCategoryField$(value: any) {
    this.selectedCategoryField.next(value);
  }

  get selectedField$(): Observable<string> {
    return this.selectedField.asObservable();
  }
  set selectedField$(value: any) {
    this.selectedField.next(value);
  }

  get coins$(): Observable<CoinType[]> {
    return this.coins.asObservable();
  }
  set coins$(value: any) {
    this.coins.next(value);
  }

  get transactionPagination$(): Observable<IPagination> {
    return this.transactionPagination.asObservable();
  }

  get loadingTransactions$(): Observable<boolean> {
    return this.loadingTransactions.asObservable();
  }

  get loadingCoins$(): Observable<boolean> {
    return this.loadingCoins.asObservable();
  }

  get loadingTopups$(): Observable<boolean> {
    return this.loadingTopups.asObservable();
  }

  get topupPagination$(): Observable<IPagination> {
    return this.topupPagination.asObservable();
  }

  get transactions$(): Observable<WalletTransactionType[]> {
    return this.transactions.asObservable();
  }

  get walletTopup$(): Observable<WalletTopupType[]> {
    return this.walletTopup.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateWalletTopupGQL: UpdateWalletTopupGQL,
    private createWalletTopupGQL: CreateWalletTopupGQL,
    private getWalletTopupsValueGQL: GetWalletTopupsValueGQL,
    private getCoinsByCountryPaginatedGQL: GetCoinsByCountryPaginatedGQL,
    private getCoinsByCategoryPaginatedGQL: GetCoinsByCategoryPaginatedGQL,
    private getWalletTopupsByTargetPaginatedGQL: GetWalletTopupsByTargetPaginatedGQL,
    private getWalletTransactionsStatsByAffectedGQL: GetWalletTransactionsStatsByAffectedGQL,
    private getWalletTransactionsByAffectedPaginatedGQL: GetWalletTransactionsByAffectedPaginatedGQL,
    private getWalletTransactionsStatsChartWithFilterGQL: GetWalletTransactionsStatsChartWithFilterGQL,
    private getWalletTransactionsByAffectedPaginatedByExcelGQL: GetWalletTransactionsByAffectedPaginatedByExcelGQL,
  ) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false)),
      )
      .subscribe((result) => {
        this._countries$.next(result.countries);
        this._total$.next(result.total);
      });
    this._search$.next();
  }

  getWalletTransactionsByAffectedPaginatedByExcel(filter?: WalletTransactionsByAffectedFilterInput): Observable<WalletTopupType> {
    return this.getWalletTransactionsByAffectedPaginatedByExcelGQL
      .fetch({
        filter: {
          ...(filter?.reason?.length ? { reason: filter?.reason } : {}),
          ...(filter?.transactionId?.length ? { transactionId: filter?.transactionId } : {}),
          ...(filter?.walletType?.length ? { walletType: filter?.walletType } : {}),
          ...(filter?.from ? { from: filter.from } : {}),
          ...(filter?.includeAllCustomers === true ? { includeAllCustomers: filter?.includeAllCustomers } : {}),
          ...(filter?.to ? { to: filter.to } : {}),
          ...(filter?.affected?.length ? { affected: filter?.affected } : { affected: [{ pos: this.storageHelper.getData('posId') }] }),
        },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getWalletTransactionsByAffectedPaginatedByExcel.content;
          }
        }),
      );
  }

  getWalletTransactionsByAffectedPaginated(filter?: any): Observable<WalletTransactionType[]> {
    this.loadingTransactions.next(true);
    return this.getWalletTransactionsByAffectedPaginatedGQL
      .fetch({
        filter: {
          ...(filter?.reason?.length ? { reason: filter?.reason } : {}),
          ...(filter?.transactionId?.length ? { transactionId: filter?.transactionId } : {}),
          ...(filter?.walletType?.length ? { walletType: filter?.walletType } : {}),
          ...(filter?.from ? { from: filter.from } : {}),
          ...(filter?.includeAllCustomers === true ? { includeAllCustomers: filter?.includeAllCustomers } : {}),
          ...(filter?.to ? { to: filter.to } : {}),
          ...(filter?.affected?.length ? { affected: filter?.affected } : { affected: [{ pos: this.storageHelper.getData('posId') }] }),
        },
        pagination: { page: this.transactionPageIndex, limit: this.transactionPageLimit },
      })
      .pipe(
        catchError(() => {
          this.loadingTransactions.next(false);
          return of(null);
        }),
        map(({ data }: any) => {
          this.loadingTransactions.next(false);
          if (data) {
            this.transactionPagination.next({
              page: this.transactionPageIndex,
              size: this.transactionPageLimit,
              length: data.getWalletTransactionsByAffectedPaginated.count,
            });
            this.transactions.next(data?.getWalletTransactionsByAffectedPaginated?.objects);
            return data?.getWalletTransactionsByAffectedPaginated?.objects;
          }
        }),
      );
  }

  createWalletTopup(input: WalletTopupInput): Observable<WalletTopupType> {
    return this.createWalletTopupGQL
      .mutate({
        input,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.walletTopup.next([data.createWalletTopup, ...(this.walletTopup.value || [])]);
            return data.createWalletTopup;
          }
        }),
      );
  }

  updateWalletTopup(id: string, input: WalletTopupInput): Observable<WalletTopupType> {
    return this.updateWalletTopupGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.walletTopup.value, (wallet) => wallet?.id === id);
          this.walletTopup.value[index] = data.updateWalletTopup;
          this.walletTopup.next(this.walletTopup.value);
          return data.updateWalletTopup;
        }
      }),
    );
  }

  getWalletTransactionsStatsChartWithFilter(
    filter: WalletTransactionsStatsChartFilterInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<WalletTransactionsStatsChartType> {
    this.loadingWalletChart.next(true);
    return this.getWalletTransactionsStatsChartWithFilterGQL.fetch({ filter }, { fetchPolicy }).pipe(
      catchError(() => {
        this.loadingWalletChart.next(false);
        return of(null);
      }),
      map(({ data }: any) => {
        this.loadingWalletChart.next(false);
        if (data) {
          this.walletChart.next(data.getWalletTransactionsStatsChartWithFilter);
          return data.getWalletTransactionsStatsChartWithFilter;
        }
      }),
    );
  }

  getWalletTransactionsStatsByAffected(fetchPolicy: FetchPolicy = 'cache-first'): Observable<WalletTransactionsStatsType> {
    this.loadingStats.next(true);
    return this.getWalletTransactionsStatsByAffectedGQL.fetch({ affected: { pos: this.storageHelper.getData('posId') } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingStats.next(false);
          this.stats.next(data.getWalletTransactionsStatsByAffected);
          return data.getWalletTransactionsStatsByAffected;
        }
      }),
    );
  }

  getCoinsByCountryPaginated(country?: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<CoinType[]> {
    this.loadingCoins.next(true);
    return this.getCoinsByCountryPaginatedGQL
      .fetch({ ...(country ? { country, pagination: { page: 0, limit: 200 } } : { pagination: { page: 0, limit: 200 } }) }, { fetchPolicy })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingCoins.next(false);
            this.coins.next(data.getCoinsByCountryPaginated.objects);
            return data.getCoinsByCountryPaginated.objects;
          }
        }),
      );
  }

  getCoinsByCategoryPaginated(fetchPolicy: FetchPolicy = 'cache-first'): Observable<CoinType[]> {
    return this.getCoinsByCategoryPaginatedGQL
      .fetch({ categories: CoinCategoryEnum.CRYPTO, pagination: { page: 0, limit: 20 } }, { fetchPolicy })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.coins.next(data.getCoinsByCategoryPaginated.objects);
            return data.getCoinsByCategoryPaginated;
          }
        }),
      );
  }

  getWalletTopupsValue(amount: string, wallet: string): Observable<WalletTopupCurrencyType> {
    return this.getWalletTopupsValueGQL.fetch({ amount, wallet }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getWalletTopupsValue;
        }
      }),
    );
  }

  getWalletTopupsByTargetPaginated(fetchPolicy: FetchPolicy = 'cache-first'): Observable<WalletTopupType[]> {
    this.loadingTopups.next(true);
    return this.getWalletTopupsByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.pageIndex, limit: this.pageLimit } }, { fetchPolicy })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingTopups.next(false);
            this.topupPagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getWalletTopupsByTargetPaginated?.count,
            });
            this.walletTopup.next(data.getWalletTopupsByTargetPaginated.objects);
            return data.getWalletTopupsByTargetPaginated.objects;
          }
        }),
      );
  }
}
