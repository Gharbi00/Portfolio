import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { PurchaseDeliveryNoteType } from '@sifca-monorepo/terminal-generator';
import {
  SaleInvoicesStatsType,
  PurchasedeliverynoteGQL,
  PurchaseDeliveryNoteInput,
  CreatePurchaseDeliveryNoteGQL,
  UpdatePurchaseDeliveryNoteGQL,
  PurchaseDeliveryNotePaginateType,
  GetPurchaseDeliveryNoteStatsWithFilterGQL,
  GetPurchaseDeliveryNotesByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private loadingNotes: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SaleInvoicesStatsType> = new BehaviorSubject(null);
  private note: BehaviorSubject<PurchaseDeliveryNoteType> = new BehaviorSubject(null);
  private notes: BehaviorSubject<PurchaseDeliveryNoteType[]> = new BehaviorSubject(null);
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
  get loadingNotes$(): Observable<boolean> {
    return this.loadingNotes.asObservable();
  }
  get notes$(): Observable<PurchaseDeliveryNoteType[]> {
    return this.notes.asObservable();
  }

  get note$(): Observable<PurchaseDeliveryNoteType> {
    return this.note.asObservable();
  }

  get stats$(): Observable<SaleInvoicesStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private invoicingService: InvoicingService,
    private purchasedeliverynoteGQL: PurchasedeliverynoteGQL,
    private createPurchaseDeliveryNoteGQL: CreatePurchaseDeliveryNoteGQL,
    private updatePurchaseDeliveryNoteGQL: UpdatePurchaseDeliveryNoteGQL,
    private getPurchaseDeliveryNoteStatsWithFilterGQL: GetPurchaseDeliveryNoteStatsWithFilterGQL,
    private getPurchaseDeliveryNotesByTargetPaginatedGQL: GetPurchaseDeliveryNotesByTargetPaginatedGQL,
  ) {}

  getPurchaseDeliveryNoteStatsWithFilter(): Observable<SaleInvoicesStatsType> {
    return this.getPurchaseDeliveryNoteStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getPurchaseDeliveryNoteStatsWithFilter);
          return data.getPurchaseDeliveryNoteStatsWithFilter;
        }
      }),
    );
  }

  getPurchaseDeliveryNotesByTargetPaginated(): Observable<PurchaseDeliveryNotePaginateType> {
    this.loadingNotes.next(true);
    return this.getPurchaseDeliveryNotesByTargetPaginatedGQL
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
            this.loadingNotes.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getPurchaseDeliveryNotesByTargetPaginated?.count,
            });
            this.notes.next(response.data.getPurchaseDeliveryNotesByTargetPaginated.objects);
            return response.data.getPurchaseDeliveryNotesByTargetPaginated;
          }
        }),
      );
  }

  getPurchaseDeliveryNoteById(id: string): Observable<PurchaseDeliveryNoteType> {
    return this.purchasedeliverynoteGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.note.next(data.purchasedeliverynote);
          this.invoicingService.item$ = data.purchasedeliverynote;
          return data.purchasedeliverynote;
        }
      }),
    );
  }

  createPurchaseDeliveryNote(input: PurchaseDeliveryNoteInput): Observable<PurchaseDeliveryNoteType> {
    return this.createPurchaseDeliveryNoteGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.note.next(data.createPurchaseDeliveryNote);
          return data.createPurchaseDeliveryNote;
        }
      }),
    );
  }

  updatePurchaseDeliveryNote(id: string, input: PurchaseDeliveryNoteInput): Observable<PurchaseDeliveryNoteType> {
    return this.updatePurchaseDeliveryNoteGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.note.next(data.updatePurchaseDeliveryNote);
          return data.updatePurchaseDeliveryNote;
        }
      }),
    );
  }
}
