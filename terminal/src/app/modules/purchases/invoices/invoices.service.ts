import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { PurchaseDeliveryNoteType, PurchaseInvoiceType } from '@sifca-monorepo/terminal-generator';
import {
  PurchaseInvoiceGQL,
  PurchaseInvoiceInput,
  SaleInvoicesStatsType,
  CreatePurchaseInvoiceGQL,
  UpdatePurchaseInvoiceGQL,
  PurchaseInvoicePaginateType,
  GetPurchaseInvoicesStatsWithFilterGQL,
  GetPurchaseInvoicesByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class PurchaseInvoicesService {
  private loadingInvoices: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SaleInvoicesStatsType> = new BehaviorSubject(null);
  private invoice: BehaviorSubject<PurchaseInvoiceType> = new BehaviorSubject(null);
  private invoices: BehaviorSubject<PurchaseInvoiceType[]> = new BehaviorSubject(null);
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
  get loadingInvoices$(): Observable<boolean> {
    return this.loadingInvoices.asObservable();
  }
  get invoices$(): Observable<PurchaseInvoiceType[]> {
    return this.invoices.asObservable();
  }

  get invoice$(): Observable<PurchaseInvoiceType> {
    return this.invoice.asObservable();
  }
  get stats$(): Observable<SaleInvoicesStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private invoicingService: InvoicingService,
    private purchaseInvoiceGQL: PurchaseInvoiceGQL,
    private createPurchaseInvoiceGQL: CreatePurchaseInvoiceGQL,
    private updatePurchaseInvoiceGQL: UpdatePurchaseInvoiceGQL,
    private getPurchaseInvoicesStatsWithFilterGQL: GetPurchaseInvoicesStatsWithFilterGQL,
    private getPurchaseInvoicesByTargetPaginatedGQL: GetPurchaseInvoicesByTargetPaginatedGQL,
  ) {}

  getPurchaseInvoicesStatsWithFilter(): Observable<SaleInvoicesStatsType> {
    return this.getPurchaseInvoicesStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getPurchaseInvoicesStatsWithFilter);
          return data.getPurchaseInvoicesStatsWithFilter;
        }
      }),
    );
  }

  getPurchaseInvoicesByTargetPaginated(): Observable<PurchaseInvoicePaginateType> {
    this.loadingInvoices.next(true);
    return this.getPurchaseInvoicesByTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
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
            this.loadingInvoices.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getPurchaseInvoicesByTargetPaginated?.count,
            });
            this.invoices.next(response.data.getPurchaseInvoicesByTargetPaginated.objects);
            return response.data.getPurchaseInvoicesByTargetPaginated;
          }
        }),
      );
  }

  getPurchaseInvoiceById(id: string): Observable<PurchaseInvoiceType> {
    return this.purchaseInvoiceGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.invoice.next(data.purchaseInvoice);
          this.invoicingService.item$ = data.purchaseInvoice;
          return data.purchaseInvoice;
        }
      }),
    );
  }

  createPurchaseInvoice(input: PurchaseInvoiceInput): Observable<PurchaseInvoiceType> {
    return this.createPurchaseInvoiceGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.invoice.next(data.createPurchaseInvoice);
          return data.createPurchaseInvoice;
        }
      }),
    );
  }

  updatePurchaseInvoice(id: string, input: PurchaseInvoiceInput): Observable<PurchaseDeliveryNoteType> {
    return this.updatePurchaseInvoiceGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.invoice.next(data.updatePurchaseInvoice);
          return data.updatePurchaseInvoice;
        }
      }),
    );
  }
}
