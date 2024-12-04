import { Injectable } from '@angular/core';
import { map as rxMap } from 'rxjs/operators';
import { map } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  AnalyticsDashboardInput,
  CrmDashboardInput,
  EcommerceAnalyticsBestSellerType,
  GetEcommerceAnalyticsStatsGQL,
  GetEcommerceBestSellerProductsWithFilterPaginatedGQL,
  GetEcommerceRevenueChartStatsGQL,
  GetEcommerceSalesByLocationGQL,
  GetEcommerceTopCatalogueCategoriesGQL,
  FindTargetOrdersGQL,
  GetTargetOrdersByExcelGQL,
  MarketPlaceOrderFilterInput,
  MarketPlaceOrderDtoType,
  SalesAnalyticsRevenueStatsType,
  SalesAnalyticsSalesByCountryType,
  SalesAnalyticsStatsType,
  SalesAnalyticsTopCatalogueCategoriesType,
  SalesDashboardInput,
  InvoicePdfType,
  UserType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class EcommerceAnalyticsService {
  orderPageIndex = 0;
  orderPageLimit = 5;
  bestSellerIndex = 0;
  bestSellerLimit = 5;
  orderNumberPageIndex = 0;

  private loadingStats: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastNumbers: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingRevenue: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingBestSeller: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingTopCatalogue: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingTargetOrders: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private orderPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private targetOrderNumbers: BehaviorSubject<string[]> = new BehaviorSubject(null);
  private targetOrderUsers: BehaviorSubject<UserType[]> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SalesAnalyticsStatsType> = new BehaviorSubject(null);
  private loadingSalesByLocation: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private bestSellerPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private targetOrders: BehaviorSubject<MarketPlaceOrderDtoType[]> = new BehaviorSubject(null);
  private revenueChart: BehaviorSubject<SalesAnalyticsRevenueStatsType> = new BehaviorSubject(null);
  private bestSeller: BehaviorSubject<EcommerceAnalyticsBestSellerType[]> = new BehaviorSubject(null);
  private salesByLocation: BehaviorSubject<SalesAnalyticsSalesByCountryType> = new BehaviorSubject(null);
  private salesByCategory: BehaviorSubject<SalesAnalyticsTopCatalogueCategoriesType[]> = new BehaviorSubject(null);

  get loadingRevenue$(): Observable<boolean> {
    return this.loadingRevenue.asObservable();
  }

  get targetOrderUsers$(): Observable<UserType[]> {
    return this.targetOrderUsers.asObservable();
  }

  get isLastNumbers$(): Observable<boolean> {
    return this.isLastNumbers.asObservable();
  }

  get targetOrderNumbers$(): Observable<string[]> {
    return this.targetOrderNumbers.asObservable();
  }

  set targetOrderNumbers$(value: any) {
    this.targetOrderNumbers.next(value);
  }

  get loadingTopCatalogue$(): Observable<boolean> {
    return this.loadingTopCatalogue.asObservable();
  }

  get stats$(): Observable<SalesAnalyticsStatsType> {
    return this.stats.asObservable();
  }

  set stats$(newValue: any) {
    this.stats.next(newValue);
  }

  get revenueChart$(): Observable<SalesAnalyticsRevenueStatsType> {
    return this.revenueChart.asObservable();
  }

  set revenueChart$(newValue: any) {
    this.revenueChart.next(newValue);
  }

  get salesByLocation$(): Observable<SalesAnalyticsSalesByCountryType> {
    return this.salesByLocation.asObservable();
  }

  set salesByLocation$(newValue: any) {
    this.salesByLocation.next(newValue);
  }

  get salesByCategory$(): Observable<SalesAnalyticsTopCatalogueCategoriesType[]> {
    return this.salesByCategory.asObservable();
  }

  get loadingStats$(): Observable<boolean> {
    return this.loadingStats.asObservable();
  }

  get targetOrders$(): Observable<MarketPlaceOrderDtoType[]> {
    return this.targetOrders.asObservable();
  }

  get loadingTargetOrders$(): Observable<boolean> {
    return this.loadingTargetOrders.asObservable();
  }

  get loadingSalesByLocation$(): Observable<boolean> {
    return this.loadingSalesByLocation.asObservable();
  }

  get bestSeller$(): Observable<EcommerceAnalyticsBestSellerType[]> {
    return this.bestSeller.asObservable();
  }

  get loadingBestSeller$(): Observable<boolean> {
    return this.loadingBestSeller.asObservable();
  }

  get bestSellerPagination$(): Observable<IPagination> {
    return this.bestSellerPagination.asObservable();
  }

  get orderPagination$(): Observable<IPagination> {
    return this.orderPagination.asObservable();
  }

  set salesByCategory$(newValue: any) {
    this.salesByCategory.next(newValue);
  }

  constructor(
    private storageHelper: StorageHelper,
    private findTargetOrdersGQL: FindTargetOrdersGQL,
    private getTargetOrdersByExcelGQL: GetTargetOrdersByExcelGQL,
    private getEcommerceAnalyticsStatsGQL: GetEcommerceAnalyticsStatsGQL,
    private getEcommerceSalesByLocationGQL: GetEcommerceSalesByLocationGQL,
    private getEcommerceRevenueChartStatsGQL: GetEcommerceRevenueChartStatsGQL,
    private getEcommerceTopCatalogueCategoriesGQL: GetEcommerceTopCatalogueCategoriesGQL,
    private getEcommerceBestSellerProductsWithFilterPaginatedGQL: GetEcommerceBestSellerProductsWithFilterPaginatedGQL,
  ) {}

  getEcommerceAnalyticsStats(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<SalesAnalyticsStatsType> {
    this.loadingStats.next(true);
    return this.getEcommerceAnalyticsStatsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingStats.next(false);
          if (data) {
            this.stats.next(data.getEcommerceAnalyticsStats);
            return data.getEcommerceAnalyticsStats;
          }
        }),
      );
  }

  getEcommerceRevenueChartStats(input: CrmDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<SalesAnalyticsRevenueStatsType> {
    this.loadingRevenue.next(true);
    return this.getEcommerceRevenueChartStatsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingRevenue.next(false);
          if (data) {
            this.revenueChart.next(data.getEcommerceRevenueChartStats);
            return data.getEcommerceRevenueChartStats;
          }
        }),
      );
  }

  findTargetOrders(input: MarketPlaceOrderFilterInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<MarketPlaceOrderDtoType[]> {
    this.loadingTargetOrders.next(true);
    return this.findTargetOrdersGQL
      .fetch(
        {
          pagination: { page: this.orderPageIndex, limit: this.orderPageLimit },
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingTargetOrders.next(false);
          if (data) {
            this.orderPagination.next({
              page: this.orderPageIndex,
              size: this.orderPageLimit,
              length: data.findTargetOrders?.count,
            });
            this.targetOrders.next(data.findTargetOrders.objects);
            return data.findTargetOrders.objects;
          }
        }),
      );
  }

  findTargetOrderNumber(input: MarketPlaceOrderFilterInput): Observable<MarketPlaceOrderDtoType[]> {
    return this.findTargetOrdersGQL
      .fetch({
        pagination: { page: this.orderNumberPageIndex, limit: this.orderPageLimit },
        input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.isLastNumbers.next(data.findTargetOrders?.isLast);
            this.targetOrderUsers.next([...(this.targetOrderUsers.value || []), ...map(data.findTargetOrders.objects as any, 'user')]);
            this.targetOrderNumbers.next([...(this.targetOrderNumbers.value || []), ...map(data.findTargetOrders.objects as any, 'number')]);
            return data.findTargetOrders.objects;
          }
        }),
      );
  }

  getTargetOrdersByExcel(input: MarketPlaceOrderFilterInput): Observable<InvoicePdfType> {
    return this.getTargetOrdersByExcelGQL
      .fetch({
        input,
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            return data.getTargetOrdersByExcel;
          }
        }),
      );
  }

  getEcommerceSalesByLocation(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<SalesAnalyticsSalesByCountryType> {
    this.loadingSalesByLocation.next(true);
    return this.getEcommerceSalesByLocationGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingSalesByLocation.next(false);
          if (data) {
            this.salesByLocation.next(data.getEcommerceSalesByLocation);
            return data.getEcommerceSalesByLocation;
          }
        }),
      );
  }

  getEcommerceBestSellerProductsWithFilterPaginated(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<EcommerceAnalyticsBestSellerType[]> {
    this.loadingBestSeller.next(true);
    return this.getEcommerceBestSellerProductsWithFilterPaginatedGQL
      .fetch(
        {
          pagination: { page: this.bestSellerIndex, limit: this.bestSellerLimit },
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingBestSeller.next(false);
          if (data) {
            this.bestSellerPagination.next({
              page: this.bestSellerIndex,
              size: this.bestSellerLimit,
              length: data.getEcommerceBestSellerProductsWithFilterPaginated?.count,
            });
            this.bestSeller.next(data.getEcommerceBestSellerProductsWithFilterPaginated.objects);
            return data.getEcommerceBestSellerProductsWithFilterPaginated.objects;
          }
        }),
      );
  }

  getEcommerceTopCatalogueCategories(
    input: SalesDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<SalesAnalyticsTopCatalogueCategoriesType[]> {
    this.loadingTopCatalogue.next(true);
    return this.getEcommerceTopCatalogueCategoriesGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.loadingTopCatalogue.next(false);
            this.salesByCategory.next(data.getEcommerceTopCatalogueCategories);
            return data.getEcommerceTopCatalogueCategories;
          }
        }),
      );
  }
}
