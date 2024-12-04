import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { SaleInvoiceType } from '@sifca-monorepo/terminal-generator';
import {
  SaleInvoiceGQL,
  SaleInvoiceInput,
  CreateSaleInvoiceGQL,
  UpdateSaleInvoiceGQL,
  SaleInvoicesStatsType,
  SaleInvoicePaginateType,
  GetSaleInvoicesStatsWithFilterGQL,
  GetSaleInvoicesByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class SaleInvoicesService {
  private invoice: BehaviorSubject<SaleInvoiceType> = new BehaviorSubject(null);
  private loadingInvoices: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private invoices: BehaviorSubject<SaleInvoiceType[]> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SaleInvoicesStatsType> = new BehaviorSubject(null);
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
  get invoices$(): Observable<SaleInvoiceType[]> {
    return this.invoices.asObservable();
  }

  get invoice$(): Observable<SaleInvoiceType> {
    return this.invoice.asObservable();
  }
  get stats$(): Observable<SaleInvoicesStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private saleInvoiceGQL: SaleInvoiceGQL,
    private invoicingService: InvoicingService,
    private createSaleInvoiceGQL: CreateSaleInvoiceGQL,
    private updateSaleInvoiceGQL: UpdateSaleInvoiceGQL,
    private getSaleInvoicesStatsWithFilterGQL: GetSaleInvoicesStatsWithFilterGQL,
    private getSaleInvoicesByTargetPaginatedGQL: GetSaleInvoicesByTargetPaginatedGQL,
  ) {}

  getSaleInvoicesStatsWithFilter(): Observable<SaleInvoicesStatsType> {
    return this.getSaleInvoicesStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getSaleInvoicesStatsWithFilter);
          return data.getSaleInvoicesStatsWithFilter;
        }
      }),
    );
  }

  getSaleInvoicesByTargetPaginated(): Observable<SaleInvoicePaginateType> {
    this.loadingInvoices.next(true);
    return this.getSaleInvoicesByTargetPaginatedGQL
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
              length: response.data.getSaleInvoicesByTargetPaginated?.count,
            });
            this.invoices.next(response.data.getSaleInvoicesByTargetPaginated.objects);
            return response.data.getSaleInvoicesByTargetPaginated;
          }
        }),
      );
  }

  getInvoiceById(id: string): Observable<SaleInvoiceType> {
    return this.saleInvoiceGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.invoice.next(data.saleInvoice);
          this.invoicingService.item$ = data.saleInvoice;
          return data.saleInvoice;
        }
      }),
    );
  }

  createSaleInvoice(input: SaleInvoiceInput): Observable<SaleInvoiceType> {
    return this.createSaleInvoiceGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.invoice.next(data.createSaleInvoice);
          return data.createSaleInvoice;
        }
      }),
    );
  }

  updateSaleInvoice(id: string, input: SaleInvoiceInput): Observable<SaleInvoiceType> {
    return this.updateSaleInvoiceGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.invoice.next(data.updateSaleInvoice);
          return data.updateSaleInvoice;
        }
      }),
    );
  }
}
