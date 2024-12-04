import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { PurchaseOrderType } from '@sifca-monorepo/terminal-generator';
import {
  PurchaseOrderGQL,
  PurchaseOrderInput,
  SaleInvoicesStatsType,
  CreatePurchaseOrderGQL,
  UpdatePurchaseOrderGQL,
  PurchaseOrderPaginateType,
  GetPurchaseOrdersStatsWithFilterGQL,
  GetPurchaseOrdersByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private loadingPurchases: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private purchase: BehaviorSubject<PurchaseOrderType> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SaleInvoicesStatsType> = new BehaviorSubject(null);
  private purchases: BehaviorSubject<PurchaseOrderType[]> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);

  to: string;
  status = [];
  number = [];
  from: string;
  pageIndex = 0;
  pageLimit = 10;
  searchString = '';

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get loadingPurchases$(): Observable<boolean> {
    return this.loadingPurchases.asObservable();
  }
  get purchases$(): Observable<PurchaseOrderType[]> {
    return this.purchases.asObservable();
  }
  get purchase$(): Observable<PurchaseOrderType> {
    return this.purchase.asObservable();
  }
  get stats$(): Observable<SaleInvoicesStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private purchaseOrderGQL: PurchaseOrderGQL,
    private invoicingService: InvoicingService,
    private createPurchaseOrderGQL: CreatePurchaseOrderGQL,
    private updatePurchaseOrderGQL: UpdatePurchaseOrderGQL,
    private getPurchaseOrdersStatsWithFilterGQL: GetPurchaseOrdersStatsWithFilterGQL,
    private getPurchaseOrdersByTargetPaginatedGQL: GetPurchaseOrdersByTargetPaginatedGQL,
  ) {}

  getPurchaseOrdersStatsWithFilter(): Observable<SaleInvoicesStatsType> {
    return this.getPurchaseOrdersStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getPurchaseOrdersStatsWithFilter);
          return data.getPurchaseOrdersStatsWithFilter;
        }
      }),
    );
  }

  getPurchaseOrdersByTargetPaginated(): Observable<PurchaseOrderPaginateType> {
    this.loadingPurchases.next(true);
    return this.getPurchaseOrdersByTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        filter: {
          ...(this.to ? { to: this.to } : {}),
          ...(this.from ? { from: this.from } : {}),
          ...(this.status?.length ? { status: this.status } : {}),
          ...(this.number?.length ? { number: this.number } : {}),
        },
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.loadingPurchases.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getPurchaseOrdersByTargetPaginated?.count,
            });
            this.purchases.next(response.data.getPurchaseOrdersByTargetPaginated.objects);
            return response.data.getPurchaseOrdersByTargetPaginated;
          }
        }),
      );
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrderType> {
    return this.purchaseOrderGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.purchase.next(data.purchaseOrder);
          this.invoicingService.item$ = data.purchaseOrder;
          return data.purchaseOrder;
        }
      }),
    );
  }

  createPurchaseOrder(input: PurchaseOrderInput): Observable<PurchaseOrderType> {
    return this.createPurchaseOrderGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.purchase.next(data.createPurchaseOrder);
          return data.createPurchaseOrder;
        }
      }),
    );
  }

  updatePurchaseOrder(id: string, input: PurchaseOrderInput): Observable<PurchaseOrderType> {
    return this.updatePurchaseOrderGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.purchase.next(data.updatePurchaseOrder);
          return data.updatePurchaseOrder;
        }
      }),
    );
  }
}
