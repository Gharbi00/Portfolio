import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  CorporateUserCardType,
  CorporateUserCardWithReputationType,
  CardTypeEnum,
  InvoicePdfType,
  MailResponseDto,
  SuccessResponseDtoType,
  ExpireCorporateUserCardGQL,
  GetTargetUserCardsByExcelGQL,
  SendTargetUserCardsBymailGQL,
  ImportTargetUserCardsByExcelGQL,
  GetCorporateUserCardsByTargetWithReputationsPaginatedGQL,
  CorporateUserCardFilterInput,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingCards: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private cards: BehaviorSubject<CorporateUserCardType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;

  get loadingCards$(): Observable<boolean> {
    return this.loadingCards.asObservable();
  }
  get cards$(): Observable<CorporateUserCardType[]> {
    return this.cards.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private expireCorporateUserCardGQL: ExpireCorporateUserCardGQL,
    private getTargetUserCardsByExcelGQL: GetTargetUserCardsByExcelGQL,
    private sendTargetUserCardsBymailGQL: SendTargetUserCardsBymailGQL,
    private importTargetUserCardsByExcelGQL: ImportTargetUserCardsByExcelGQL,
    private getCorporateUserCardsByTargetWithReputationsPaginatedGQL: GetCorporateUserCardsByTargetWithReputationsPaginatedGQL,
  ) {}

  importTargetUserCardsByExcel(base64: string): Observable<SuccessResponseDtoType> {
    return this.importTargetUserCardsByExcelGQL
      .mutate({
        base64,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          return data.importTargetUserCardsByExcel;
        }),
      );
  }

  sendTargetUserCardsBymail(cardType: CardTypeEnum, emails: string): Observable<MailResponseDto> {
    return this.sendTargetUserCardsBymailGQL
      .fetch({
        cardType,
        emails,
        subject: 'Your export of cards',
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendTargetUserCardsBymail;
          }
        }),
      );
  }

  getCorporateUserCardsByTargetWithReputationsPaginated(filter?: CorporateUserCardFilterInput): Observable<CorporateUserCardWithReputationType[]> {
    this.loadingCards.next(true);
    return this.getCorporateUserCardsByTargetWithReputationsPaginatedGQL
      .fetch({ filter, target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.pageIndex, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          this.loadingCards.next(false);
          this.cards.next(data.getCorporateUserCardsByTargetWithReputationsPaginated.objects);
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getCorporateUserCardsByTargetWithReputationsPaginated.count,
          });
          return data.getCorporateUserCardsByTargetWithReputationsPaginated.objects;
        }),
      );
  }

  expireCorporateUserCard(id: string): Observable<boolean> {
    return this.expireCorporateUserCardGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const currentDate: Date = new Date();
          const index = this.cards?.value.findIndex((item) => item.id === id);
          if (index > -1) {
            this.cards.value[index].validUntil = currentDate;
            this.cards.next(this.cards.value);
          }
          return data.expireCorporateUserCard.success;
        }
      }),
    );
  }

  getTargetUserCardsByExcel(): Observable<InvoicePdfType> {
    return this.getTargetUserCardsByExcelGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getTargetUserCardsByExcel.content;
        }
      }),
    );
  }
}
