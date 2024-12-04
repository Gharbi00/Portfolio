import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  ProductClassEnum,
  InternalProductType,
  UpdateInternalProductInput,
  UpdateInternalProductGQL,
  GetInternalProductsByClassGQL,
  SearchInternalProductByTargetGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class ProductGroupService {
  private isLastProduct: BehaviorSubject<boolean | null> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);
  private groupPagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);
  private loadingProductGroup: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private products: BehaviorSubject<InternalProductType[] | null> = new BehaviorSubject(null);
  private productGroup: BehaviorSubject<InternalProductType[] | null> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  groupPage = 0;
  groupLimit = 10;

  constructor(
    private storageHelper: StorageHelper,
    private updateInternalProductGQL: UpdateInternalProductGQL,
    private getInternalProductsByClassGQL: GetInternalProductsByClassGQL,
    private searchInternalProductByTargetGQL: SearchInternalProductByTargetGQL,
  ) {}

  get productGroup$(): Observable<InternalProductType[]> {
    return this.productGroup.asObservable();
  }

  get loadingProductGroup$(): Observable<boolean> {
    return this.loadingProductGroup.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get groupPagination$(): Observable<IPagination> {
    return this.groupPagination.asObservable();
  }

  get isLastProduct$(): Observable<boolean> {
    return this.isLastProduct.asObservable();
  }

  get products$(): Observable<InternalProductType[]> {
    return this.products.asObservable();
  }

  getInternalProductsByClass(iclass: ProductClassEnum[] = []): Observable<InternalProductType[]> {
    this.loadingProductGroup.next(true);
    return this.getInternalProductsByClassGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { limit: this.groupLimit, page: this.groupPage },
        classification: iclass,
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.productGroup.next(response.data.getInternalProductsByClass.objects);
            this.loadingProductGroup.next(false);
            this.groupPagination.next({
              length: response.data.getInternalProductsByClass.count,
              size: this.groupLimit,
              page: this.groupPage,
            });
            return response.data.getInternalProductsByClass.objects;
          }
        }),
      );
  }

  searchInternalProductByTarget(searchString = ''): Observable<InternalProductType[]> {
    return this.searchInternalProductByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        ...(searchString ? { searchString } : { searchString: '' }),
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.pagination.next({
              length: response.data.searchInternalProductByTarget.count,
              size: this.pageLimit,
              page: this.pageIndex,
            });
            this.products.next(
              this.pageIndex === 0
                ? response.data.searchInternalProductByTarget.objects
                : [...this.products.value, ...response.data.searchInternalProductByTarget.objects],
            );
            this.isLastProduct.next(response.data.searchInternalProductByTarget.isLast);
            return response.data.searchInternalProductByTarget.objects;
          }
        }),
      );
  }

  addProductToGroup(input: UpdateInternalProductInput): Observable<InternalProductType[]> {
    return this.updateInternalProductGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.productGroup.next([response.data.updateInternalProduct, ...this.productGroup.value]);
          return [response.data.updateInternalProduct, ...this.productGroup.value];
        }
      }),
    );
  }

  deleteProductFromGroup(input: UpdateInternalProductInput): Observable<InternalProductType[]> {
    return this.updateInternalProductGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          const group = this.productGroup.value;
          group.splice(
            group.findIndex((p) => p.id === input.id),
            1,
          );
          this.productGroup.next(group);
          return group;
        }
      }),
    );
  }
}
