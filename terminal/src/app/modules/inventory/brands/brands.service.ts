import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  BrandType,
  BrandInput,
  BrandPaginateType,
  BrandGQL,
  CreateBrandGQL,
  DeleteBrandGQL,
  SearchBrandGQL,
  UpdateBrandGQL,
  GetBrandsByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  brand: BehaviorSubject<BrandType> = new BehaviorSubject(null);
  private brands: BehaviorSubject<BrandType[]> = new BehaviorSubject(null);
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private infinteBrands: BehaviorSubject<BrandType[]> = new BehaviorSubject(null);
  private loadingBrands: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';

  get infinteBrands$(): Observable<BrandType[]> {
    return this.infinteBrands.asObservable();
  }
  set infinteBrands$(value: any) {
    this.infinteBrands.next(value);
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  get brand$(): Observable<BrandType> {
    return this.brand.asObservable();
  }

  get brands$(): Observable<BrandType[]> {
    return this.brands.asObservable();
  }

  get loadingBrands$(): Observable<boolean> {
    return this.loadingBrands.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private brandGQL: BrandGQL,
    private storageHelper: StorageHelper,
    private createBrandGQL: CreateBrandGQL,
    private updateBrandGQL: UpdateBrandGQL,
    private deleteBrandGQL: DeleteBrandGQL,
    private searchBrandGQL: SearchBrandGQL,
    private getBrandsByTargetPaginatedGQL: GetBrandsByTargetPaginatedGQL,
  ) {}

  createBrand(input: BrandInput): Observable<BrandType> {
    return this.createBrandGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map((newBrand: any) => {
        this.brands.next([newBrand.data.createBrand, ...(this.brands.value?.length ? this.brands.value : [])]);
        return newBrand.data.createBrand;
      }),
    );
  }

  updateBrand(id: string, input: BrandInput): Observable<BrandType> {
    return this.updateBrandGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const brands = this.brands.value;
          const index = this.brands.value?.findIndex((a) => a.id === id);
          brands[index] = data.updateBrand;
          this.brands.next(brands);
          return data.updateBrand;
        }
        return null;
      }),
    );
  }

  deleteBrand(id: string): Observable<boolean> {
    return this.deleteBrandGQL.mutate({ id }).pipe(
      map((response: any) => {
        if (response.data.deleteBrand) {
          const brands = this.brands.value.filter((item) => item.id !== id);
          this.brands.next(brands);
          return true;
        }
        return false;
      }),
    );
  }

  getBrands(): Observable<BrandPaginateType> {
    return this.getBrandsByTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getBrandsByTargetPaginated?.count,
          });
          return data.getBrandsByTargetPaginated as any;
        }),
      );
  }

  searchBrand(): Observable<BrandPaginateType> {
    this.loadingBrands.next(true);
    return this.searchBrandGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: {
          page: this.pageIndex,
          limit: this.pageLimit,
        },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.brands.next(data.searchBrand.objects);
            this.isLast.next(data.searchBrand.isLast);
            this.loadingBrands.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.searchBrand?.count,
            });
            this.infinteBrands.next([...data.searchBrand.objects, ...(this.infinteBrands.value || [])]);
            return data.searchBrand.objects;
          }
        }),
      );
  }

  getBrandById(id: string): Observable<BrandType> {
    return this.brandGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.brand.next(data.brand);
          return data.brand;
        }
      }),
    );
  }
}
