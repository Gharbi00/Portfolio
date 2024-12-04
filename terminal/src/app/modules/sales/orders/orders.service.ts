import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { SaleOrderType } from '@sifca-monorepo/terminal-generator';
import {
  SaleOrderGQL,
  SaleOrderInput,
  CreateSaleOrderGQL,
  UpdateSaleOrderGQL,
  SaleOrdersStatsType,
  SaleOrderPaginateType,
  GetSaleOrdersStatsWithFilterGQL,
  GetSaleOrdersByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class SalesOrdersService {
  private loadingOrders: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private orders: BehaviorSubject<SaleOrderType[]> = new BehaviorSubject(null);
  private order: BehaviorSubject<SaleOrderType> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private stats: BehaviorSubject<SaleOrdersStatsType> = new BehaviorSubject<SaleOrdersStatsType>(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';
  from: string;
  to: string;
  status = [];
  number = [];

  get stats$(): Observable<SaleOrdersStatsType> {
    return this.stats.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get loadingOrders$(): Observable<boolean> {
    return this.loadingOrders.asObservable();
  }
  get orders$(): Observable<SaleOrderType[]> {
    return this.orders.asObservable();
  }
  get order$(): Observable<SaleOrderType> {
    return this.order.asObservable();
  }

  constructor(
    private saleOrderGQL: SaleOrderGQL,
    private storageHelper: StorageHelper,
    private invoicingService: InvoicingService,
    private createSaleOrderGQL: CreateSaleOrderGQL,
    private updateSaleOrderGQL: UpdateSaleOrderGQL,
    private getSaleOrdersByTargetPaginatedGQL: GetSaleOrdersByTargetPaginatedGQL,
    private getSaleOrdersStatsWithFilterGQL: GetSaleOrdersStatsWithFilterGQL,
  ) {}

  getSaleOrdersStatsWithFilter(): Observable<SaleOrdersStatsType> {
    return this.getSaleOrdersStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getSaleOrdersStatsWithFilter);
          return data.getSaleOrdersStatsWithFilter;
        }
      }),
    );
  }

  getSaleOrdersByTargetPaginated(): Observable<SaleOrderPaginateType> {
    this.loadingOrders.next(true);
    return this.getSaleOrdersByTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        filter: {
          ...(this.from ? { from: this.from } : {}),
          ...(this.to ? { to: this.to } : {}),
          ...(this.status?.length ? { status: this.status } : {}),
          ...(this.number?.length ? { number: this.number } : {}),
        },
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getSaleOrdersByTargetPaginated?.count,
            });
            this.loadingOrders.next(false);
            this.orders.next(response.data.getSaleOrdersByTargetPaginated.objects);
            return response.data.getSaleOrdersByTargetPaginated;
          }
        }),
      );
  }

  getSaleOrderById(id: string): Observable<SaleOrderType> {
    return this.saleOrderGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.order.next(data.saleOrder);
          this.invoicingService.item$ = data.saleOrder;
          return data.saleOrder;
        }
      }),
    );
  }

  createSaleOrder(input: SaleOrderInput): Observable<SaleOrderType> {
    return this.createSaleOrderGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.order.next(data.createSaleOrder);
          return data.createSaleOrder;
        }
      }),
    );
  }

  updateSaleOrder(id: string, input: SaleOrderInput): Observable<SaleOrderType> {
    return this.updateSaleOrderGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.order.next(data.updateSaleOrder);
          return data.updateSaleOrder;
        }
      }),
    );
  }
}
