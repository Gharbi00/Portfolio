import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import {
  PromotionInput,
  BarcodeType,
  PromotionType,
  PromotionUpdateInput,
  DeleteResponseDtoType,
  PromotionPaginateType,
  PromotionGQL,
  CreatePromotionGQL,
  DeletePromotionGQL,
  UpdatePromotionGQL,
  GetPromotionsByTargetPaginationGQL,
} from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class PromotionsService {
  private promotions: BehaviorSubject<PromotionType[]> = new BehaviorSubject(null);
  private promotion: BehaviorSubject<PromotionType> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private barcodes: BehaviorSubject<BarcodeType[]> = new BehaviorSubject(null);
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingPromotions: BehaviorSubject<boolean> = new BehaviorSubject(null);

  searchString = '';
  pageIndex = 0;
  filterLimit = 10;
  infinitBarcodes$: Observable<BarcodeType[]>;
  startDate: string;
  endDate: string;
  statuses = [];

  get loadingPromotions$(): Observable<boolean> {
    return this.loadingPromotions.asObservable();
  }
  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }
  get promotions$(): Observable<PromotionType[]> {
    return this.promotions.asObservable();
  }
  get promotion$(): Observable<PromotionType> {
    return this.promotion.asObservable();
  }
  set promotion$(value: any) {
    this.promotion.next(value);
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get barcodes$(): Observable<BarcodeType[]> {
    return this.barcodes.asObservable();
  }

  constructor(
    private promotionGQL: PromotionGQL,
    private storageHelper: StorageHelper,
    private deletePromotionGQL: DeletePromotionGQL,
    private updatePromotionGQL: UpdatePromotionGQL,
    private createPromotionGQL: CreatePromotionGQL,
    private getPromotionsByTargetPaginationGQL: GetPromotionsByTargetPaginationGQL,
  ) {}

  getPromotionsByTargetPagination(filter = {}): Observable<PromotionPaginateType> {
    this.loadingPromotions.next(true);
    return this.getPromotionsByTargetPaginationGQL
      .fetch({
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.loadingPromotions.next(false);
            this.promotions.next(data.getPromotionsByTargetPagination.objects);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.getPromotionsByTargetPagination.count,
            });
            return data.getPromotionsByTargetPagination.objects;
          }
        }),
      );
  }

  createPromotion(input: PromotionInput): Observable<PromotionType[]> {
    return this.createPromotionGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.promotions.next([response.data.createPromotion, ...(this.promotions.value || [])]);
          return response.data.createPromotion;
        }
      }),
    );
  }

  deletePromotion(id: string): Observable<DeleteResponseDtoType> {
    return this.promotions$.pipe(
      take(1),
      switchMap((promotions) =>
        this.deletePromotionGQL.mutate({ id }).pipe(
          map((response) => {
            if (response.data.deletePromotion.success) {
              const index = promotions.findIndex((item) => item.id === id);
              promotions.splice(index, 1);
              this.promotions.next(promotions);
            }
            return response.data.deletePromotion;
          }),
        ),
      ),
    );
  }

  getPromotionById(id: string): Observable<PromotionType[]> {
    return this.promotionGQL.fetch({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.promotion.next(response.data.promotion);
          return response.data.promotion;
        }
      }),
    );
  }

  updatePromotion(id: string, input: PromotionUpdateInput): Observable<PromotionType[]> {
    return this.updatePromotionGQL.mutate({ id, input }).pipe(
      tap((response: any) => {
        if (response.data) {
          return response.data.updatePromotion;
        }
      }),
    );
  }
}
