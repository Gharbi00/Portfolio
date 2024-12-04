import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import {
  StockPaginateType,
  GetStockGQL,
  InitStockGQL,
  DeleteStockGQL,
  UpdateStockGQL,
  AddToStockGQL,
  RemoveFromStockGQL,
  GetStocksByTargetGQL,
  SearchStocksByTargetGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { DeleteResponseDtoType, StockType } from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private loadingStocks: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private stock: BehaviorSubject<StockType> = new BehaviorSubject(null);
  private paginationRange: BehaviorSubject<number[]> = new BehaviorSubject([0]);
  private stocks: BehaviorSubject<any[]> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);

  searchString = '';
  warehouses: string[] = [];
  pageIndex = 0;
  filterLimit = 10;

  constructor(
    private getStockGQL: GetStockGQL,
    private initStockGQL: InitStockGQL,
    private storageHelper: StorageHelper,
    private addToStockGQL: AddToStockGQL,
    private deleteStockGQL: DeleteStockGQL,
    private updateStockGQL: UpdateStockGQL,
    private removeFromStockGQL: RemoveFromStockGQL,
    private getStocksByTargetGQL: GetStocksByTargetGQL,
    private searchStocksByTargetGQL: SearchStocksByTargetGQL,
  ) {}

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get loadingStocks$(): Observable<boolean> {
    return this.loadingStocks.asObservable();
  }
  get stocks$(): Observable<any[]> {
    return this.stocks.asObservable();
  }
  get stock$(): Observable<StockType> {
    return this.stock.asObservable();
  }

  get paginationRange$(): Observable<number[]> {
    return this.paginationRange.asObservable();
  }

  getStocks(outOfStock?: boolean): Observable<StockPaginateType> {
    return this.getStocksByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        ...(outOfStock === true || outOfStock === false ? { outOfStock } : {}),
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getStocksByTarget?.count,
          });
          this.stocks.next(data.getStocksByTarget.objects);
          return data.getStocksByTarget;
        }),
      ) as Observable<any>;
  }

  searchStocksByTarget(outOfStock?: boolean, sortingField?: string, sortingOrder?: 1 | -1): Observable<StockPaginateType> {
    this.loadingStocks.next(true);
    return this.searchStocksByTargetGQL
      .fetch({
        sortingField,
        sortingOrder,
        searchString: this.searchString,
        warehouses: this.warehouses,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        ...(outOfStock === true || outOfStock === false ? { outOfStock } : {}),
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.searchStocksByTarget?.count,
          });
          this.stocks.next(data.searchStocksByTarget.objects);
          this.loadingStocks.next(false);
          return data.searchStocksByTarget;
        }),
      ) as Observable<any>;
  }

  getStock(barcodeId: string, warehouse: string): Observable<StockType> {
    return this.getStockGQL.fetch({ target: { pos: this.storageHelper.getData('posId') }, barcodeId, warehouse }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getStock;
        }
      }),
    );
  }

  addToStock(id: string, quantity: number, warehouse: string): Observable<StockType> {
    return this.addToStockGQL.mutate({ id, quantity, warehouse }).pipe(
      map(({ data }: any) => {
        if (data) {
          const stocks = this.stocks.value;
          const index = stocks?.findIndex((a) => a.id === id);
          stocks[index].currentStock += quantity;
          stocks[index].updatedAt = data.addToStock.updatedAt;
          stocks[index].outOfStock = data.addToStock.outOfStock;
          stocks[index].currentStock = data.addToStock.currentStock;
          stocks[index].stockCapacity = data.addToStock.stockCapacity;
          stocks[index].stockPercentage = data.addToStock.stockPercentage;
          stocks[index].minimumStockQuantity = data.addToStock.minimumStockQuantity;
          this.stocks.next(stocks);
          return data.addToStock;
        }
      }),
    );
  }

  removeFromStock(id: string, quantity: number, warehouse: string): Observable<StockType> {
    return this.removeFromStockGQL.mutate({ id, quantity, warehouse }).pipe(
      map(({ data }: any) => {
        if (data) {
          const stocks = this.stocks.value;
          const index = stocks?.findIndex((a) => a.id === id);
          stocks[index].currentStock += quantity;
          stocks[index].updatedAt = data.removeFromStock.updatedAt;
          stocks[index].outOfStock = data.removeFromStock.outOfStock;
          stocks[index].currentStock = data.removeFromStock.currentStock;
          stocks[index].stockCapacity = data.removeFromStock.stockCapacity;
          stocks[index].stockPercentage = data.removeFromStock.stockPercentage;
          stocks[index].minimumStockQuantity = data.removeFromStock.minimumStockQuantity;
          this.stocks.next(stocks);
          return data.removeFromStock;
        }
      }),
    );
  }

  initStock(barcodeId: string, warehouse: string): Observable<StockType> {
    return this.initStockGQL.mutate({ target: { pos: this.storageHelper.getData('posId') }, barcodeId, warehouse }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.stocks.next([data.initStock, ...this.stocks.value]);
          return data.initStock;
        }
      }),
    );
  }

  deleteStock(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteStockGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const stocks = this.stocks.value.filter((a) => a.id !== id);
          this.stocks.next(stocks);
          return data.deleteStock;
        }
      }),
    );
  }

  updateStock(id: string, stock: any): Observable<StockType> {
    return this.updateStockGQL
      .mutate({
        id,
        stockCapacity: stock.stockCapacity,
        minimumStockQuantity: stock.minimumStockQuantity,
        outOfStock: stock.outOfStock,
      })
      .pipe(
        map(({ data }) => {
          const stocks = this.stocks.value;
          const index = stocks?.findIndex((a) => a.id === id);
          stocks[index] = data.updateStock;
          this.stocks.next(stocks);
          return data.updateStock;
        }),
      ) as Observable<any>;
  }

  getStockById(id: string, index: number): Observable<any> {
    return this.stocks.pipe(
      take(1),
      map((stocks) => {
        const stock = stocks[index];
        this.stock.next(stock);
        return stock;
      }),
      switchMap((stock) => {
        if (!stock || stock.id.toString() !== id) {
          return throwError(() => new Error(`Could not found stock with id of ${id}!`));
        }
        return of(stock);
      }),
    );
  }
}
