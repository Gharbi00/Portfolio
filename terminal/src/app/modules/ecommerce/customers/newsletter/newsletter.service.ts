import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import {
  UserType,
  NewsletterType,
  MailResponseDto,
  GetNewslettersByExcelGQL,
  SendNewslettersBymailGQL,
  GetSubscribersToNewsletterPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { find, sortBy } from 'lodash';
import { InvoicePDFType } from '@diktup/models/src/resources';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  private user: BehaviorSubject<UserType> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private subscribers: BehaviorSubject<NewsletterType[]> = new BehaviorSubject(null);
  private loadingNewsLetter: BehaviorSubject<boolean> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';

  get subscribers$(): Observable<NewsletterType[]> {
    return this.subscribers.asObservable();
  }

  get loadingNewsLetter$(): Observable<boolean> {
    return this.loadingNewsLetter.asObservable();
  }

  get contact$(): Observable<UserType> {
    return this.user.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private sendNewslettersBymailGQL: SendNewslettersBymailGQL,
    private getNewslettersByExcelGQL: GetNewslettersByExcelGQL,
    private getSubscribersToNewsletterPaginatedGQL: GetSubscribersToNewsletterPaginatedGQL,
  ) {}

  sendNewslettreBymail(emails: string): Observable<MailResponseDto> {
    return this.sendNewslettersBymailGQL
      .fetch({
        emails,
        subject: 'Your export of newsletters',
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendNewslettreBymail;
          }
        }),
      );
  }

  getNewslettersByExcel(): Observable<InvoicePDFType> {
    return this.getNewslettersByExcelGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getNewslettersByExcel.content;
          }
        }),
      );
  }

  getSubscribersToNewsletterPaginated(): Observable<NewsletterType[]> {
    this.loadingNewsLetter.next(true);
    return this.getSubscribersToNewsletterPaginatedGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: {
          page: this.pageIndex,
          limit: this.pageLimit,
        },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingNewsLetter.next(false);
            this.subscribers.next(sortBy(data.getSubscribersToNewsletterPaginated.objects, 'user.firstName'));
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getSubscribersToNewsletterPaginated.count,
            });
            return sortBy(data.getSubscribersToNewsletterPaginated.objects, 'user.firstName');
          }
        }),
      );
  }

  getContactById(newsletterId: string, userId: string): Observable<UserType> {
    return this.subscribers.pipe(
      take(1),
      map((subscribers) => find(subscribers, (item) => item.user.id === userId) || null),
      switchMap((contact) => {
        if (!contact) {
          return throwError(() => new Error('Could not found contact with id of ' + userId + '!'));
        }
        this.user.next(contact.user);
        return of(contact.user);
      }),
    );
  }
}
