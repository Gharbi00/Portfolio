import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { IPagination } from '@diktup/frontend/models';
import {
  ContentTypeType,
  DeleteResponseDtoType,
  TicketType,
  TicketStatsType,
  MailResponseDto,
  TicketInput,
  DocumentInput,
  TicketUpdateInput,
  TicketsPaginateType,
  FindContentTypeByTypeGQL,
  TicketGQL,
  CreateTicketGQL,
  DeleteTicketGQL,
  UpdateTicketGQL,
  CreateDocumentGQL,
  GetTicketsByExcelGQL,
  SendTicketsBymailGQL,
  GetTicketsStatsWithFilterGQL,
  GetTicketsByTargetWithFilterGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private ticket: BehaviorSubject<TicketType> = new BehaviorSubject(null);
  private tickets: BehaviorSubject<TicketType[]> = new BehaviorSubject(null);
  private stats: BehaviorSubject<TicketStatsType> = new BehaviorSubject(null);
  private loadingTickets: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);

  to: string;
  status = [];
  from: string;
  pageIndex = 0;
  priority = [];
  pageLimit = 10;
  ticketList?: any;
  searchString = '';

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get tickets$(): Observable<TicketType[]> {
    return this.tickets.asObservable();
  }

  get loadingTickets$(): Observable<boolean> {
    return this.loadingTickets.asObservable();
  }

  get ticket$(): Observable<TicketType> {
    return this.ticket.asObservable();
  }

  get stats$(): Observable<TicketStatsType> {
    return this.stats.asObservable();
  }

  constructor(
    private ticketGQL: TicketGQL,
    private storageHelper: StorageHelper,
    private deleteTicketGQL: DeleteTicketGQL,
    private createTicketGQL: CreateTicketGQL,
    private updateTicketGQL: UpdateTicketGQL,
    private createDocumentGQL: CreateDocumentGQL,
    private sendTicketsBymailGQL: SendTicketsBymailGQL,
    private getTicketsByExcelGQL: GetTicketsByExcelGQL,
    private findContentTypeByTypeGQL: FindContentTypeByTypeGQL,
    private getTicketsStatsWithFilterGQL: GetTicketsStatsWithFilterGQL,
    private getTicketsByTargetWithFilterGQL: GetTicketsByTargetWithFilterGQL,
  ) {}

  getTicketsByTargetWithFilter(): Observable<TicketsPaginateType> {
    this.loadingTickets.next(true);
    return this.getTicketsByTargetWithFilterGQL
      .fetch({
        filter: {
          ...(this.from ? { from: this.from } : {}),
          ...(this.to ? { to: this.to } : {}),
          ...(this.status?.length ? { status: this.status } : {}),
          ...(this.priority?.length ? { priority: this.priority } : {}),
        },
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getTicketsByTargetWithFilter?.count,
            });
            this.loadingTickets.next(false);
            this.tickets.next(data.getTicketsByTargetWithFilter.objects);
            return data.getTicketsByTargetWithFilter.objects;
          }
        }),
      );
  }

  sendTicketsBymail(emails: string): Observable<MailResponseDto> {
    return this.sendTicketsBymailGQL
      .fetch({
        emails,
        subject: 'Your export of tickets',
        filter: {
          ...(this.from ? { from: this.from } : {}),
          ...(this.to ? { to: this.to } : {}),
          ...(this.status?.length ? { status: this.status } : {}),
          ...(this.priority?.length ? { priority: this.priority } : {}),
        },
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendTicketsBymail;
          }
        }),
      );
  }

  getTicketsByExcel(): Observable<InvoicePdfType> {
    return this.getTicketsByExcelGQL
      .fetch({
        filter: {
          ...(this.from ? { from: this.from } : {}),
          ...(this.to ? { to: this.to } : {}),
          ...(this.status?.length ? { status: this.status } : {}),
          ...(this.priority?.length ? { priority: this.priority } : {}),
        },
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getTicketsByExcel.content;
          }
        }),
      );
  }

  getTicketsStatsWithFilter(): Observable<TicketStatsType> {
    return this.getTicketsStatsWithFilterGQL.fetch({ target: { pos: this.storageHelper.getData('posId') }, filter: {} }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stats.next(data.getTicketsStatsWithFilter);
          return data.getTicketsStatsWithFilter;
        }
      }),
    );
  }

  findContentTypeByType(type: string): Observable<ContentTypeType> {
    return this.findContentTypeByTypeGQL.fetch({ type }).pipe(
      map(({ data }: any) => {
        return data.findContentTypeByType;
      }),
    );
  }

  createDocument(input: DocumentInput): Observable<DocumentType> {
    return this.createDocumentGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        return data.createDocument;
      }),
    );
  }

  getTicketById(id: string): Observable<TicketType> {
    return this.ticketGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        this.ticket.next(data.ticket);
        return data.ticket;
      }),
    );
  }

  deleteTicket(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteTicketGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const tickets = this.tickets.value;
          const index = tickets.findIndex((item) => item.id === id);
          tickets.splice(index, 1);
          this.tickets.next(tickets);
          return data.deleteTicket;
        }
      }),
    );
  }

  createTicket(input: TicketInput): Observable<TicketType> {
    return this.createTicketGQL
      .mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') }, company: this.storageHelper.getData('company') } })
      .pipe(
        map(({ data }: any) => {
          this.tickets.next([data.createTicket, ...this.tickets.value]);
          return data.createTicket;
        }),
      );
  }

  updateTicket(input: TicketUpdateInput, id: string): Observable<TicketType> {
    if (this.tickets.value) {
      return this.updateTicketGQL.mutate({ input: { ...input, id } }).pipe(
        map(({ data }: any) => {
          const tickets = this.tickets.value;
          const index = tickets?.findIndex((a) => a.id === id);
          tickets[index] = data.updateTicket;
          this.ticket.next(data.updateTicket);
          this.tickets.next(tickets);
          return data.updateTicket;
        }),
      );
    } else {
      return this.getTicketsByTargetWithFilterGQL
        .fetch({
          filter: {
            from: this.from,
            to: this.to,
            ...(this.status?.length ? { status: this.status } : {}),
            ...(this.priority?.length ? { priority: this.priority } : {}),
          },
          target: { pos: this.storageHelper.getData('posId') },
          pagination: { page: this.pageIndex, limit: this.pageLimit },
        })
        .pipe(
          tap(({ data }: any) => {
            if (data) {
              this.pagination.next({
                page: this.pageIndex,
                size: this.pageLimit,
                length: data.getTicketsByTargetWithFilter?.count,
              });
              this.tickets.next(data.getTicketsByTargetWithFilter.objects);
              return data.getTicketsByTargetWithFilter.objects;
            }
          }),
          switchMap(() => {
            return this.updateTicketGQL.mutate({ input: { ...input, id } }).pipe(
              map(({ data }: any) => {
                const tickets = this.tickets.value;
                const index = tickets?.findIndex((a) => a.id === id);
                tickets[index] = data.updateTicket;
                this.ticket.next(data.updateTicket);
                this.tickets.next(tickets);
                return data.updateTicket;
              }),
            );
          }),
        );
    }
  }
}
