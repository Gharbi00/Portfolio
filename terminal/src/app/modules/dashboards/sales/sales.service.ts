import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  CrmDashboardInput,
  SalesDashboardInput,
  AnalyticsDashboardInput,
  SalesAnalyticsStatsType,
  SalesAnalyticsRevenueStatsType,
  EcommerceAnalyticsBestSellerType,
  SalesAnalyticsSalesByCountryType,
  GetSalesAnalyticsStatsGQL,
  GetSalesByLocationGQL,
  GetSalesRevenueChartStatsGQL,
  GetSalesTopCatalogueCategoriesGQL,
  GetSalesOrdersBestSellerProductsWithFilterPaginatedGQL,
  GetSaleOrdersByTargetPaginatedGQL,
  SendInvoicingPdfDocumentByEmailGQL,
  MailResponseDto,
  SalesAnalyticsTopCatalogueCategoriesType,
  SaleOrderType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class SalesAnalyticsService {
  bestSellerPageLimit = 10;
  bestSellerPageIndex = 0;
  saleOrderPageLimit = 10;
  saleOrderPageIndex = 0;

  private loadingRevenue: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingLocation: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingSaleOrder: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private saleOrder: BehaviorSubject<SaleOrderType[]> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SalesAnalyticsStatsType> = new BehaviorSubject(null);
  private loadingOrderBestSeller: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private bestSellerPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private saleOrdersPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private revenueChart: BehaviorSubject<SalesAnalyticsRevenueStatsType> = new BehaviorSubject(null);
  private bestSeller: BehaviorSubject<EcommerceAnalyticsBestSellerType[]> = new BehaviorSubject(null);
  private salesByLocation: BehaviorSubject<SalesAnalyticsSalesByCountryType> = new BehaviorSubject(null);
  private salesByCategory: BehaviorSubject<SalesAnalyticsTopCatalogueCategoriesType[]> = new BehaviorSubject(null);
  private loadingSalesCategory: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get loadingSalesCategory$(): Observable<boolean> {
    return this.loadingSalesCategory.asObservable();
  }

  get stats$(): Observable<SalesAnalyticsStatsType> {
    return this.stats.asObservable();
  }

  get loadingRevenue$(): Observable<boolean> {
    return this.loadingRevenue.asObservable();
  }

  get bestSeller$(): Observable<EcommerceAnalyticsBestSellerType[]> {
    return this.bestSeller.asObservable();
  }

  get loadingLocation$(): Observable<boolean> {
    return this.loadingLocation.asObservable();
  }

  get bestSellerPagination$(): Observable<IPagination> {
    return this.bestSellerPagination.asObservable();
  }

  get loadingOrderBestSeller$(): Observable<boolean> {
    return this.loadingOrderBestSeller.asObservable();
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

  get saleOrdersPagination$(): Observable<IPagination> {
    return this.saleOrdersPagination.asObservable();
  }

  set salesByLocation$(newValue: any) {
    this.salesByLocation.next(newValue);
  }

  get salesByCategory$(): Observable<SalesAnalyticsTopCatalogueCategoriesType[]> {
    return this.salesByCategory.asObservable();
  }

  get loadingSaleOrder$(): Observable<boolean> {
    return this.loadingSaleOrder.asObservable();
  }

  get saleOrder$(): Observable<SaleOrderType[]> {
    return this.saleOrder.asObservable();
  }

  set salesByCategory$(newValue: any) {
    this.salesByCategory.next(newValue);
  }

  constructor(
    private storageHelper: StorageHelper,
    private getSalesByLocationGQL: GetSalesByLocationGQL,
    private getSalesAnalyticsStatsGQL: GetSalesAnalyticsStatsGQL,
    private getSalesRevenueChartStatsGQL: GetSalesRevenueChartStatsGQL,
    private getSaleOrdersByTargetPaginatedGQL: GetSaleOrdersByTargetPaginatedGQL,
    private getSalesTopCatalogueCategoriesGQL: GetSalesTopCatalogueCategoriesGQL,
    private sendInvoicingPDFDocumentByEmailGQL: SendInvoicingPdfDocumentByEmailGQL,
    private getSalesOrdersBestSellerProductsWithFilterPaginatedGQL: GetSalesOrdersBestSellerProductsWithFilterPaginatedGQL,
  ) {}

  getSalesAnalyticsStats(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<SalesAnalyticsStatsType> {
    return this.getSalesAnalyticsStatsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.stats.next(data.getSalesAnalyticsStats);
            return data.getSalesAnalyticsStats;
          }
        }),
      );
  }

  getSalesRevenueChartStats(input: CrmDashboardInput): Observable<SalesAnalyticsRevenueStatsType> {
    this.loadingRevenue.next(true);
    return this.getSalesRevenueChartStatsGQL
      .fetch({
        input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingRevenue.next(false);
            this.revenueChart.next(data.getSalesRevenueChartStats);
            return data.getSalesRevenueChartStats;
          }
        }),
      );
  }

  getSalesByLocation(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<SalesAnalyticsSalesByCountryType> {
    this.loadingLocation.next(true);
    return this.getSalesByLocationGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingLocation.next(false);
            this.salesByLocation.next(data.getSalesByLocation);
            return data.getSalesByLocation;
          }
        }),
      );
  }

  getSalesTopCatalogueCategories(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<SalesAnalyticsTopCatalogueCategoriesType[]> {
    this.loadingSalesCategory.next(true);
    return this.getSalesTopCatalogueCategoriesGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingSalesCategory.next(false);
            this.salesByCategory.next(data.getSalesTopCatalogueCategories);
            return data.getSalesTopCatalogueCategories;
          }
        }),
      );
  }

  sendInvoicingPDFDocumentByEmail(input: any): Observable<MailResponseDto> {
    return this.sendInvoicingPDFDocumentByEmailGQL.fetch({ document: input.document, subject: input.subject, emails: input.emails }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.sendInvoicingPDFDocumentByEmail;
        }
      }),
    );
  }

  getSalesOrdersBestSellerProductsWithFilterPaginated(
    input: SalesDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<EcommerceAnalyticsBestSellerType[]> {
    this.loadingOrderBestSeller.next(true);
    return this.getSalesOrdersBestSellerProductsWithFilterPaginatedGQL
      .fetch(
        {
          pagination: { page: this.bestSellerPageIndex, limit: this.bestSellerPageLimit },
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingOrderBestSeller.next(false);
          if (data) {
            this.bestSellerPagination.next({
              page: this.bestSellerPageIndex,
              size: this.bestSellerPageLimit,
              length: data.getSalesOrdersBestSellerProductsWithFilterPaginated?.count,
            });
            this.bestSeller.next(data.getSalesOrdersBestSellerProductsWithFilterPaginated.objects);
            return data.getSalesOrdersBestSellerProductsWithFilterPaginated.objects;
          }
        }),
      );
  }

  getSaleOrdersByTargetPaginated(filter: SalesDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<SaleOrderType[]> {
    this.loadingSaleOrder.next(true);
    return this.getSaleOrdersByTargetPaginatedGQL
      .fetch(
        {
          pagination: { page: this.saleOrderPageIndex, limit: this.saleOrderPageLimit },
          filter: { from: filter?.from, to: filter?.to },
          target: { pos: this.storageHelper.getData('posId') },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingSaleOrder.next(false);
          if (data) {
            this.saleOrdersPagination.next({
              page: this.saleOrderPageIndex,
              size: this.saleOrderPageLimit,
              length: data.getSaleOrdersByTargetPaginated?.count,
            });
            this.saleOrder.next(data.getSaleOrdersByTargetPaginated.objects);
            return data.getSaleOrdersByTargetPaginated.objects;
          }
        }),
      );
  }
}
