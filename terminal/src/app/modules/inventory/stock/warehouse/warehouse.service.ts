import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import {
  WarehouseInput,
  CreateWarehouseGQL,
  DeleteWarehouseGQL,
  UpdateWarehouseGQL,
  WarehousePaginateType,
  GetWarehousesByCompanyPaginatedGQL,
  FindWarehousesByLocationPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { WarehouseType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private warehouses: BehaviorSubject<WarehouseType[]> = new BehaviorSubject(null);
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private warehouse: BehaviorSubject<WarehouseType> = new BehaviorSubject(null);
  private paginationRange: BehaviorSubject<number[]> = new BehaviorSubject([0]);
  private infinitWarehouses: BehaviorSubject<any[]> = new BehaviorSubject(null);
  private isWarehouseLastPage: BehaviorSubject<boolean> = new BehaviorSubject(null);

  searchString = '';
  company: string;
  pageIndex = 0;
  filterLimit = 10;

  get isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
  set isLoading$(value: any) {
    this.isLoading.next(value);
  }
  get isWarehouseLastPage$(): Observable<boolean> {
    return this.isWarehouseLastPage.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get warehouses$(): Observable<WarehouseType[]> {
    return this.warehouses.asObservable();
  }
  get infinitWarehouses$(): Observable<any[]> {
    return this.infinitWarehouses.asObservable();
  }
  set infinitWarehouses$(value: any) {
    this.infinitWarehouses.next(value);
  }
  get warehouse$(): Observable<WarehouseType> {
    return this.warehouse.asObservable();
  }
  get paginationRange$(): Observable<number[]> {
    return this.paginationRange.asObservable();
  }

  constructor(
    private createWarehouseGQL: CreateWarehouseGQL,
    private updateWarehouseGQL: UpdateWarehouseGQL,
    private deleteWarehouseGQL: DeleteWarehouseGQL,
    private storageHelper: StorageHelper,
    private getWarehousesByCompanyPaginatedGQL: GetWarehousesByCompanyPaginatedGQL,
    private findWarehousesByLocationPaginatedGQL: FindWarehousesByLocationPaginatedGQL,
  ) {
    this.company = this.storageHelper.getData('company');
  }

  getWarehousesByCompanyPaginated(): Observable<WarehousePaginateType> {
    this.isLoading.next(true);
    return this.getWarehousesByCompanyPaginatedGQL
      .fetch({
        searchString: this.searchString,
        company: this.company,
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getWarehousesByCompanyPaginated?.count,
          });
          this.isLoading.next(false);
          this.isWarehouseLastPage.next(data.getWarehousesByCompanyPaginated.isLast);
          this.warehouses.next(data.getWarehousesByCompanyPaginated.objects);
          this.infinitWarehouses.next([...(this.infinitWarehouses.value || []), ...data.getWarehousesByCompanyPaginated.objects]);
          return data.getWarehousesByCompanyPaginated;
        }),
      ) as Observable<any>;
  }

  findWarehousesByLocationPaginated(location: string): Observable<WarehousePaginateType> {
    return this.findWarehousesByLocationPaginatedGQL
      .fetch({
        location,
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.findWarehousesByLocationPaginated?.count,
          });
          this.warehouses.next(data.findWarehousesByLocationPaginated.objects);
          return data.findWarehousesByLocationPaginated;
        }),
      ) as Observable<any>;
  }

  getWarehouseById(id: string, index: number): Observable<WarehouseType> {
    return this.warehouses.pipe(
      take(1),
      map((warehouses) => {
        const stock = warehouses[index];
        this.warehouse.next(stock);
        return stock;
      }),
      switchMap((warehouse) => {
        if (!warehouse || warehouse.id.toString() !== id) {
          return throwError(() => new Error(`Could not found stock with id of ${id}!`));
        }
        return of(warehouse);
      }),
    );
  }

  updateWarehouse(input: WarehouseInput, id: string): Observable<WarehouseType[]> {
    return this.updateWarehouseGQL.mutate({ input, id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = this.warehouses.value.map((a) => a.id).indexOf(id);
          const warehouses = this.warehouses.value;
          warehouses[index] = data.updateWarehouse;
          this.warehouses.next(warehouses);
          return warehouses;
        }
      }),
    );
  }

  deleteWarehouse(id: string): Observable<WarehouseType> {
    return this.deleteWarehouseGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const warehouses = this.warehouses.value.filter((a) => a.id !== id);
          this.warehouses.next(warehouses);
          return data.deleteWarehouse;
        }
      }),
    );
  }

  createWarehouse(input: WarehouseInput): Observable<WarehouseType[]> {
    return this.createWarehouseGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.warehouses.next([data.createWarehouse, ...this.warehouses.value]);
          return [data.createWarehouse, ...this.warehouses.value];
        }
      }),
    );
  }
}
