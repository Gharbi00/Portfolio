import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  OutboundType,
  OutboundInput,
  MailResponseDto,
  CorporateEmailTemplateType,
  OutboundGQL,
  InsertOutboundGQL,
  UpdateOutboundGQL,
  DeleteOutboundGQL,
  GetOutboundsByTargetPaginationGQL,
  GetAppCorporateEmailsPaginatedGQL,
  RemoveAudienceFromOutboundGQL,
} from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class OutboundService {
  private outbound: BehaviorSubject<OutboundType> = new BehaviorSubject(null);
  private loadingEmails: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private outbounds: BehaviorSubject<OutboundType[]> = new BehaviorSubject(null);
  private loadingOutbounds: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private emailsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private emails: BehaviorSubject<CorporateEmailTemplateType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  emailPageIndex = 0;

  get emails$(): Observable<CorporateEmailTemplateType[]> {
    return this.emails.asObservable();
  }

  get emailsPagination$(): Observable<IPagination> {
    return this.emailsPagination.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get outbound$(): Observable<OutboundType> {
    return this.outbound.asObservable();
  }
  set outbound$(value: any) {
    this.outbound.next(value);
  }

  get outbounds$(): Observable<OutboundType[]> {
    return this.outbounds.asObservable();
  }

  get loadingOutbounds$(): Observable<boolean> {
    return this.loadingOutbounds.asObservable();
  }

  get loadingEmails$(): Observable<boolean> {
    return this.loadingEmails.asObservable();
  }

  constructor(
    private outboundGQL: OutboundGQL,
    private storageHelper: StorageHelper,
    private insertOutboundGQL: InsertOutboundGQL,
    private updateOutboundGQL: UpdateOutboundGQL,
    private deleteOutboundGQL: DeleteOutboundGQL,
    private removeAudienceFromOutboundGQL: RemoveAudienceFromOutboundGQL,
    private getAppCorporateEmailsPaginatedGQL: GetAppCorporateEmailsPaginatedGQL,
    private getOutboundsByTargetPaginationGQL: GetOutboundsByTargetPaginationGQL,
  ) {}

  getAppCorporateEmailsPaginated(): Observable<CorporateEmailTemplateType[]> {
    this.loadingEmails.next(true);
    return this.getAppCorporateEmailsPaginatedGQL
      .fetch({
        pagination: { page: this.emailPageIndex, limit: 20 },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.emails.next(data.getAppCorporateEmailsPaginated.objects);
            this.loadingEmails.next(false);
            this.emailsPagination.next({
              page: this.emailPageIndex,
              size: this.pageLimit,
              length: data.getAppCorporateEmailsPaginated.count,
            });
            return data.getAppCorporateEmailsPaginated.objects;
          }
        }),
      );
  }

  getOutboundsByTargetPagination(): Observable<OutboundType[]> {
    this.loadingOutbounds.next(true);
    return this.getOutboundsByTargetPaginationGQL
      .fetch({
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingOutbounds.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getOutboundsByTargetPagination.count,
            });
            this.outbounds.next(data.getOutboundsByTargetPagination.objects);
            return data.getOutboundsByTargetPagination.objects;
          }
        }),
      );
  }

  getOutboundById(id: string): Observable<OutboundType> {
    return this.outboundGQL
      .fetch({
        id,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.outbound.next(data.outbound);
            return data.outbound;
          }
        }),
      );
  }

  insertOutbound(input: OutboundInput): Observable<OutboundType> {
    return this.insertOutboundGQL
      .mutate({
        input: { ...input, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.outbounds.next([data.insertOutbound, ...(this.outbounds.value || [])]);
            return data.insertOutbound;
          }
        }),
      );
  }


  removeAudienceFromOutbound(id: string): Observable<OutboundType> {
    return this.removeAudienceFromOutboundGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.outbound.next(data.removeAudienceFromOutbound);
          return data.removeAudienceFromOutbound;
        }
      }),
    );
  }


  updateOutbound(id: string, input: OutboundInput): Observable<OutboundType> {
    return this.updateOutboundGQL
      .mutate({
        id,
        input,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.outbound.next(data.updateOutbound);
            return data.updateOutbound;
          }
        }),
      );
  }

  deleteOutbound(id: string): Observable<MailResponseDto> {
    return this.deleteOutboundGQL
      .mutate({
        id,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            const outbounds = this.outbounds.value.filter((item) => item.id !== id);
            this.outbounds.next(outbounds);
            return data.deleteOutbound;
          }
        }),
      );
  }
}
