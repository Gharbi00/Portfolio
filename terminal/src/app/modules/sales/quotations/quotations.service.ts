import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { PriceType, QuotationType } from '@sifca-monorepo/terminal-generator';
import {
  QuotationGQL,
  QuotationInput,
  CreateQuotationGQL,
  UpdateQuotationGQL,
  QuotationsStatsType,
  QuotationUpdateInput,
  QuotationPaginateType,
  GetQuotationsStatsWithFilterGQL,
  GetQuotationsByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class QuotationsService {
  private prices: BehaviorSubject<PriceType[]> = new BehaviorSubject<PriceType[]>(null);
  private loadingQuotations: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private quotation: BehaviorSubject<QuotationType> = new BehaviorSubject<QuotationType>(null);
  private quotations: BehaviorSubject<QuotationType[]> = new BehaviorSubject<QuotationType[]>(null);
  private stats: BehaviorSubject<QuotationsStatsType> = new BehaviorSubject<QuotationsStatsType>(null);

  to: string;
  status = [];
  number = [];
  from: string;
  pageIndex = 0;
  pageLimit = 10;
  searchString = '';

  get quotations$(): Observable<QuotationType[]> {
    return this.quotations.asObservable();
  }
  get stats$(): Observable<QuotationsStatsType> {
    return this.stats.asObservable();
  }
  get loadingQuotations$(): Observable<boolean> {
    return this.loadingQuotations.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get prices$(): Observable<PriceType[]> {
    return this.prices.asObservable();
  }
  get quotation$(): Observable<QuotationType> {
    return this.quotation.asObservable();
  }
  set quotation$(value: any) {
    this.quotation.next(value);
  }

  constructor(
    private quotationGQL: QuotationGQL,
    private storageHelper: StorageHelper,
    private invoicingService: InvoicingService,
    private createQuotationGQL: CreateQuotationGQL,
    private updateQuotationGQL: UpdateQuotationGQL,
    private getQuotationsStatsWithFilterGQL: GetQuotationsStatsWithFilterGQL,
    private getQuotationsByTargetPaginatedGQL: GetQuotationsByTargetPaginatedGQL,
  ) {}

  resetQuotation() {
    this.quotation.next(null);
  }

  getQuotationsByTargetPaginated(): Observable<QuotationPaginateType> {
    this.loadingQuotations.next(true);
    return this.getQuotationsByTargetPaginatedGQL
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
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getQuotationsByTargetPaginated?.count,
            });
            this.quotations.next(data.getQuotationsByTargetPaginated.objects);
            this.loadingQuotations.next(false);
            return data.getQuotationsByTargetPaginated;
          }
        }),
      );
  }

  getQuotationsStatsWithFilter(): Observable<QuotationsStatsType> {
    return this.getQuotationsStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getQuotationsStatsWithFilter);
          return data.getQuotationsStatsWithFilter;
        }
      }),
    );
  }

  getQuotationById(id: string): Observable<QuotationType> {
    return this.quotationGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.quotation.next(data.quotation);
          this.invoicingService.item$ = data.quotation;
          return data.quotation;
        }
      }),
    );
  }

  createQuotation(input: QuotationInput): Observable<QuotationType> {
    return this.createQuotationGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.quotation.next(data.createQuotation);
          return data.createQuotation;
        }
      }),
    );
  }

  updateQuotation(input: QuotationUpdateInput): Observable<QuotationType> {
    return this.updateQuotationGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.quotation.next(data.updateQuotation);
          return data.updateQuotation;
        }
      }),
    );
  }
}
