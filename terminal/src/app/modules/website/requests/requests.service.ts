import { Injectable } from '@angular/core';
import { map as rxMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { RequestStatusEnum, RequestType, RequestTypeEnum, UserType } from '@sifca-monorepo/terminal-generator';
import { JobApplicationBaseType } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import {
  MailResponseDto,
  RequestPaginateType,
  GetRequestGQL,
  GetRequestsByExcelGQL,
  GetRequestsByTypeAndTargetPaginatedGQL,
  SendRequestsBymailGQL,
  UpdateRequestStatusGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class RequestsService {
  private loadingRequests: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private users: BehaviorSubject<UserType[]> = new BehaviorSubject(null);
  private application: BehaviorSubject<JobApplicationBaseType> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private requests: BehaviorSubject<RequestType[]> = new BehaviorSubject(null);
  private request: BehaviorSubject<RequestType> = new BehaviorSubject(null);

  to: string;
  from: string;
  pageIndex = 0;
  filterLimit = 10;
  type: RequestTypeEnum;
  searchString = '';

  get requests$(): Observable<RequestType[]> {
    return this.requests.asObservable();
  }

  get loadingRequests$(): Observable<boolean> {
    return this.loadingRequests.asObservable();
  }

  get request$(): Observable<RequestType> {
    return this.request.asObservable();
  }

  set request$(value: any) {
    this.request.next(value);
  }

  get application$(): Observable<JobApplicationBaseType> {
    return this.application.asObservable();
  }

  get users$(): Observable<UserType[]> {
    return this.users.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private getRequestGQL: GetRequestGQL,
    private storageHelper: StorageHelper,
    private sendRequestsBymailGQL: SendRequestsBymailGQL,
    private getRequestsByExcelGQL: GetRequestsByExcelGQL,
    private updateRequestStatusGQL: UpdateRequestStatusGQL,
    private getRequestsByTypeAndTargetPaginatedGQL: GetRequestsByTypeAndTargetPaginatedGQL,
  ) {}

  getRequestsByExcel(): Observable<InvoicePdfType> {
    return this.getRequestsByExcelGQL
      .fetch({
        ...(this.type ? { type: this.type } : {}),
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            return data.getRequestsByExcel.content;
          }
        }),
      );
  }

  sendRequestsBymail(emails: string): Observable<MailResponseDto> {
    return this.sendRequestsBymailGQL
      .fetch({
        ...(this.type ? { type: this.type } : {}),
        searchString: this.searchString,
        emails,
        subject: 'Your export of requests',
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            return data.sendRequestsBymail;
          }
        }),
      );
  }

  getRequest(id: string): Observable<RequestType> {
    return this.getRequestGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        this.request.next(data.getRequest);
        return data.getRequest;
      }),
    );
  }

  updateRequestStatus(id: string, status: RequestStatusEnum): Observable<RequestType> {
    return this.updateRequestStatusGQL.mutate({ id, status }).pipe(
      rxMap(({ data }: any) => {
        const index = this.requests.value.findIndex((item) => item.id === id);
        this.requests.value[index] = data.updateRequestStatus;
        this.requests.next(this.requests.value);
        return data.updateRequestStatus;
      }),
    );
  }

  getRequestsByTypeAndTargetPaginated(): Observable<RequestPaginateType> {
    this.loadingRequests.next(true);
    return this.getRequestsByTypeAndTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        ...(this.type ? { type: this.type } : {}),
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        searchString: this.searchString,
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingRequests.next(false);
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getRequestsByTypeAndTargetPaginated?.count,
          });
          this.requests.next(data.getRequestsByTypeAndTargetPaginated.objects);
          return data.getRequestsByTypeAndTargetPaginated;
        }),
      );
  }
}
