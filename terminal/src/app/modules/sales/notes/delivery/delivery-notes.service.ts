import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { SaleDeliveryNoteType } from '@sifca-monorepo/terminal-generator';
import {
  SaledeliverynoteGQL,
  SaleDeliveryNoteInput,
  SaleInvoicesStatsType,
  CreateSaleDeliveryNoteGQL,
  UpdateSaleDeliveryNoteGQL,
  SaleDeliveryNotePaginateType,
  GetSaleDeliveryNoteStatsWithFilterGQL,
  GetSaleDeliveryNotesByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class DeliveryNotesService {
  private loadingDelivries: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SaleInvoicesStatsType> = new BehaviorSubject(null);
  private deliveryNote: BehaviorSubject<SaleDeliveryNoteType> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private deliveryNotes: BehaviorSubject<SaleDeliveryNoteType[]> = new BehaviorSubject(null);

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
  get loadingDelivries$(): Observable<boolean> {
    return this.loadingDelivries.asObservable();
  }
  get deliveryNotes$(): Observable<SaleDeliveryNoteType[]> {
    return this.deliveryNotes.asObservable();
  }

  get deliveryNote$(): Observable<SaleDeliveryNoteType> {
    return this.deliveryNote.asObservable();
  }
  get stats$(): Observable<SaleInvoicesStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private invoicingService: InvoicingService,
    private saledeliverynoteGQL: SaledeliverynoteGQL,
    private createSaleDeliveryNoteGQL: CreateSaleDeliveryNoteGQL,
    private updateSaleDeliveryNoteGQL: UpdateSaleDeliveryNoteGQL,
    private getSaleDeliveryNoteStatsWithFilterGQL: GetSaleDeliveryNoteStatsWithFilterGQL,
    private getSaleDeliveryNotesByTargetPaginatedGQL: GetSaleDeliveryNotesByTargetPaginatedGQL,
  ) {}

  getSaleDeliveryNoteStatsWithFilter(): Observable<SaleInvoicesStatsType> {
    return this.getSaleDeliveryNoteStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getSaleDeliveryNoteStatsWithFilter);
          return data.getSaleDeliveryNoteStatsWithFilter;
        }
      }),
    );
  }

  getSaleDeliveryNotesByTargetPaginated(): Observable<SaleDeliveryNotePaginateType> {
    this.loadingDelivries.next(true);
    return this.getSaleDeliveryNotesByTargetPaginatedGQL
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
            this.loadingDelivries.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getSaleDeliveryNotesByTargetPaginated?.count,
            });
            this.deliveryNotes.next(response.data.getSaleDeliveryNotesByTargetPaginated.objects);
            return response.data.getSaleDeliveryNotesByTargetPaginated;
          }
        }),
      );
  }

  getDeliveryNoteById(id: string): Observable<SaleDeliveryNoteType> {
    return this.saledeliverynoteGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.deliveryNote.next(data.saledeliverynote);
          this.invoicingService.item$ = data.saledeliverynote;
          return data.saledeliverynote;
        }
      }),
    );
  }

  createSaleDeliveryNote(input: SaleDeliveryNoteInput): Observable<SaleDeliveryNoteType> {
    return this.createSaleDeliveryNoteGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.deliveryNote.next(data.createSaleDeliveryNote);
          return data.createSaleDeliveryNote;
        }
      }),
    );
  }

  updateSaleDeliveryNote(id: string, input: SaleDeliveryNoteInput): Observable<SaleDeliveryNoteType> {
    return this.updateSaleDeliveryNoteGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.deliveryNote.next(data.updateSaleDeliveryNote);
          return data.updateSaleDeliveryNote;
        }
      }),
    );
  }
}
