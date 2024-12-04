import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import {
  CouponType,
  CouponInput,
  CouponsInput,
  MailResponseDto,
  CouponFilterInput,
  UpdateCouponInput,
  CreateCouponGQL,
  UpdateCouponGQL,
  DisableCouponGQL,
  GenerateCouponsGQL,
  GetCouponsByExcelGQL,
  SendCouponsBymailGQL,
  FindCouponsByTargetWithFilterPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { keys } from 'lodash';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class CouponsService {
  private loadingCoupons: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private coupons: BehaviorSubject<CouponType[] | null> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);

  pageLimit = 10;
  pageIndex = 0;
  searchString = '';

  get loadingCoupons$(): Observable<boolean> {
    return this.loadingCoupons.asObservable();
  }

  get coupons$(): Observable<CouponType[]> {
    return this.coupons.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private createCouponGQL: CreateCouponGQL,
    private updateCouponGQL: UpdateCouponGQL,
    private disableCouponGQL: DisableCouponGQL,
    private generateCouponsGQL: GenerateCouponsGQL,
    private getCouponsByExcelGQL: GetCouponsByExcelGQL,
    private sendCouponsBymailGQL: SendCouponsBymailGQL,
    private findCouponsByTargetWithFilterPaginatedGQL: FindCouponsByTargetWithFilterPaginatedGQL,
  ) {}

  sendCouponsBymail(emails: string, filter?: CouponFilterInput): Observable<MailResponseDto> {
    return this.sendCouponsBymailGQL
      .fetch({
        filter: {
          ...(keys(filter?.discountType).length > 0 ? { discountType: filter?.discountType } : {}),
          ...(filter?.expired ? { expired: filter?.expired } : {}),
          ...(filter?.discountType ? { discountType: filter?.discountType } : {}),
          ...(filter?.redeemed ? { redeemed: filter?.redeemed } : {}),
          ...(filter?.discountType ? { discountType: filter?.discountType } : {}),
          ...(filter?.couponCode ? { couponCode: filter?.couponCode } : {}),
        },
        searchString: this.searchString,
        emails,
        subject: 'Your export of coupons',
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          return data.sendCouponsBymail;
        }),
      );
  }

  getCouponsByExcel(filter?: CouponFilterInput): Observable<InvoicePdfType> {
    return this.getCouponsByExcelGQL
      .fetch({
        filter: {
          ...(keys(filter?.discountType).length > 0 ? { discountType: filter?.discountType } : {}),
          ...(filter?.expired ? { expired: filter?.expired } : {}),
          ...(filter?.discountType ? { discountType: filter?.discountType } : {}),
          ...(filter?.redeemed ? { redeemed: filter?.redeemed } : {}),
          ...(filter?.discountType ? { discountType: filter?.discountType } : {}),
          ...(filter?.couponCode ? { couponCode: filter?.couponCode } : {}),
        },
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getCouponsByExcel.content;
          }
        }),
      );
  }

  findCouponsByTargetWithFilterPaginated(filter?: CouponFilterInput): Observable<CouponType[]> {
    this.loadingCoupons.next(true);
    return this.findCouponsByTargetWithFilterPaginatedGQL
      .fetch({
        filter: {
          ...(keys(filter?.discountType).length > 0 ? { discountType: filter?.discountType } : {}),
          ...(filter?.expired ? { expired: filter?.expired } : {}),
          ...(filter?.discountType ? { discountType: filter?.discountType } : {}),
          ...(filter?.redeemed ? { redeemed: filter?.redeemed } : {}),
          ...(filter?.discountType ? { discountType: filter?.discountType } : {}),
          ...(filter?.couponCode ? { couponCode: filter?.couponCode } : {}),
        },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.loadingCoupons.next(false);
            this.coupons.next(response.data.findCouponsByTargetWithFilterPaginated.objects);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.findCouponsByTargetWithFilterPaginated.count,
            });
            return response.data.findCouponsByTargetWithFilterPaginated.objects;
          }
        }),
      );
  }

  createCoupon(input: CouponInput): Observable<CouponType[]> {
    return this.createCouponGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.coupons.next([response.data.createCoupon, ...this.coupons.value]);
          return [response.data.createCoupon, ...this.coupons.value];
        }
      }),
    );
  }

  generateCoupons(input: CouponsInput, page: number = 0, limit: number = 10): Observable<CouponType[]> {
    return this.generateCouponsGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.coupons.next([...response.data.generateCoupons, ...this.coupons.value]);
          this.pagination.next({
            page,
            size: limit,
            length: response.data.generateCoupons.length + this.pagination.value.length,
          });
          return [...response.data.generateCoupons, ...this.coupons.value];
        }
      }),
    );
  }

  updateCoupon(id: string, input: UpdateCouponInput): Observable<CouponType> {
    return this.updateCouponGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const coupons = this.coupons.value;
          const index = coupons.findIndex((c) => c.id === id);
          coupons[index] = data.updateCoupon;
          this.coupons.next(coupons);
          return coupons;
        }
      }),
    );
  }

  disableCoupon(id: string): Observable<CouponType> {
    return this.disableCouponGQL.mutate({ id }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const coupons = this.coupons.value;
          const index = coupons.findIndex((c) => c.id === id);
          coupons[index] = data.disableCoupon;
          this.coupons.next(coupons);
          return coupons;
        }
      }),
    );
  }
}
