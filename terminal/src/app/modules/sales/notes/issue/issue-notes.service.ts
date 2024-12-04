import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { SaleIssueNoteType } from '@sifca-monorepo/terminal-generator';
import {
  SaleIssueNoteGQL,
  SaleIssueNoteInput,
  CreateSaleIssueNoteGQL,
  SaleIssueNoteStatsType,
  UpdateSaleIssueNoteGQL,
  SaleIssueNotePaginateType,
  GetSaleIssueNotesStatsWithFilterGQL,
  GetSaleIssueNotesByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class IssueNotesService {
  private loadingIssues: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private issueNote: BehaviorSubject<SaleIssueNoteType> = new BehaviorSubject(null);
  private stats: BehaviorSubject<SaleIssueNoteStatsType> = new BehaviorSubject(null);
  private issueNotes: BehaviorSubject<SaleIssueNoteType[]> = new BehaviorSubject(null);
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
  get loadingIssues$(): Observable<boolean> {
    return this.loadingIssues.asObservable();
  }
  get issueNotes$(): Observable<SaleIssueNoteType[]> {
    return this.issueNotes.asObservable();
  }

  get issueNote$(): Observable<SaleIssueNoteType> {
    return this.issueNote.asObservable();
  }

  get stats$(): Observable<SaleIssueNoteStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private invoicingService: InvoicingService,
    private saleIssueNoteGQL: SaleIssueNoteGQL,
    private createSaleIssueNoteGQL: CreateSaleIssueNoteGQL,
    private updateSaleIssueNoteGQL: UpdateSaleIssueNoteGQL,
    private getSaleIssueNotesStatsWithFilterGQL: GetSaleIssueNotesStatsWithFilterGQL,
    private getSaleIssueNotesByTargetPaginatedGQL: GetSaleIssueNotesByTargetPaginatedGQL,
  ) {}

  getSaleIssueNotesStatsWithFilter(): Observable<SaleIssueNoteStatsType> {
    return this.getSaleIssueNotesStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getSaleIssueNotesStatsWithFilter);
          return data.getSaleIssueNotesStatsWithFilter;
        }
      }),
    );
  }

  getSaleIssueNotesByTargetPaginated(): Observable<SaleIssueNotePaginateType> {
    this.loadingIssues.next(true);
    return this.getSaleIssueNotesByTargetPaginatedGQL
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
            this.loadingIssues.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.getSaleIssueNotesByTargetPaginated?.count,
            });
            this.issueNotes.next(response.data.getSaleIssueNotesByTargetPaginated.objects);
            return response.data.getSaleIssueNotesByTargetPaginated;
          }
        }),
      );
  }

  getIssueNoteById(id: string): Observable<SaleIssueNoteType> {
    return this.saleIssueNoteGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.issueNote.next(data.saleIssueNote);
          this.invoicingService.item$ = data.saleIssueNote;
          return data.saleIssueNote;
        }
      }),
    );
  }

  createSaleIssueNote(input: SaleIssueNoteInput): Observable<SaleIssueNoteType> {
    return this.createSaleIssueNoteGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.issueNote.next(data.createSaleIssueNote);
          return data.createSaleIssueNote;
        }
      }),
    );
  }

  updateSaleIssueNote(id: string, input: SaleIssueNoteInput): Observable<SaleIssueNoteType> {
    return this.updateSaleIssueNoteGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.issueNote.next(data.updateSaleIssueNote);
          return data.updateSaleIssueNote;
        }
      }),
    );
  }
}
