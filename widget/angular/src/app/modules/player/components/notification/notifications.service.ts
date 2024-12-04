import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  CorporateNotificationType,
  CountUnseenCorporateNotificationsForUserGQL,
  EventTypeEnum,
  MarkAllCorporateNotificationsAsSeenForUserGQL,
} from '@sifca-monorepo/widget-generator';
import { GetCorporateNotificationsForUserPaginatedGQL } from '@sifca-monorepo/widget-generator';
import { IPagination } from '@diktup/frontend/models';
import { filter } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private isLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private unreadNotif: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private unseenNotificationsCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private loadingNotifications: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private notifications: BehaviorSubject<CorporateNotificationType[]> = new BehaviorSubject<CorporateNotificationType[]>([]);

  page = 0;
  pageLimit = 10;

  get pageIndex(): number {
    return this.page;
  }
  set pageIndex(value: number) {
    this.page = value;
  }

  get unreadNotif$(): Observable<boolean> {
    return this.unreadNotif.asObservable();
  }
  set unreadNotif$(value: any) {
    this.unreadNotif.next(value);
  }

  get notifications$(): Observable<CorporateNotificationType[]> {
    return this.notifications.asObservable();
  }
  set notifications$(value: any) {
    this.notifications.next(value);
  }

  get isLastPage$(): Observable<boolean> {
    return this.isLastPage.asObservable();
  }

  get loadingNotifications$(): Observable<boolean> {
    return this.loadingNotifications.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get unseenNotificationsCount$(): Observable<number> {
    return this.unseenNotificationsCount.asObservable();
  }

  constructor(
    private countUnseenCorporateNotificationsForUserGQL: CountUnseenCorporateNotificationsForUserGQL,
    private getCorporateNotificationsForUserPaginatedGQL: GetCorporateNotificationsForUserPaginatedGQL,
    private markAllCorporateNotificationsAsSeenForUserGQL: MarkAllCorporateNotificationsAsSeenForUserGQL,
  ) {}

  countUnseenCorporateNotificationsForUser(): Observable<number> {
    return this.countUnseenCorporateNotificationsForUserGQL.fetch({ target: { pos: (window as any).widgetInit.appId } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.unseenNotificationsCount.next(data.countUnseenCorporateNotificationsForUser.count);
          return data.countUnseenCorporateNotificationsForUser.count;
        }
      }),
    );
  }

  getCorporateNotificationsForUserPaginated(): Observable<CorporateNotificationType[]> {
    this.loadingNotifications.next(true);
    return this.getCorporateNotificationsForUserPaginatedGQL
      .fetch({ target: { pos: (window as any).widgetInit.appId }, pagination: { page: this.page, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getCorporateNotificationsForUserPaginated?.count,
          });
          this.notifications.next(filter(data.getCorporateNotificationsForUserPaginated.objects, (notif) => notif.event !== EventTypeEnum.OUTBOUND_WIDGET));
          this.loadingNotifications.next(false);
          this.isLastPage.next(data.getCorporateNotificationsForUserPaginated.isLast);
          return data.getCorporateNotificationsForUserPaginated.objects;
        }),
      );
  }

  markAllCorporateNotificationsAsSeenForUser(): Observable<boolean> {
    return this.markAllCorporateNotificationsAsSeenForUserGQL
      .mutate({ target: { pos: (window as any).widgetInit.appId } })
      .pipe(map(({ data }) => data.markAllCorporateNotificationsAsSeenForUser.success));
  }
}
