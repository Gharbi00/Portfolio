import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ProductClicksType, FindProductClicksByOwnerPaginatedGQL } from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class ClicksService {
  private loadingClicks: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private clicks: BehaviorSubject<ProductClicksType[] | null> = new BehaviorSubject(null);

  pageIndex = 0;
  posId: string;
  pageLimit = 20;
  searchString = '';

  constructor(private storageHelper: StorageHelper, private findProductClicksByOwnerPaginatedGQL: FindProductClicksByOwnerPaginatedGQL) {}

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get clicks$(): Observable<ProductClicksType[]> {
    return this.clicks.asObservable();
  }
  get loadingClicks$(): Observable<boolean> {
    return this.loadingClicks.asObservable();
  }

  findProductClicksByOwnerPaginated(): Observable<ProductClicksType[]> {
    this.loadingClicks.next(true);
    return this.findProductClicksByOwnerPaginatedGQL
      .fetch({
        owner: { pos: this.storageHelper.getData('posId') },
        // target: { pos: this.storageHelper.getData('posId') },
        ...(this.searchString ? { searchString: this.searchString } : {}),
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.clicks.next(data.findProductClicksByOwnerPaginated.objects);
            console.log('🚀 ~ ClicksService ~ map ~ this.clicks:', this.clicks.value);
            this.loadingClicks.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.findProductClicksByOwnerPaginated.count,
            });
            return data.findProductClicksByOwnerPaginated.objects;
          }
        }),
      );
  }
}
