import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { FindTargetShoppingCartsGQL } from '@sifca-monorepo/terminal-generator';
import { ShoppingCartsForTargetType } from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class OpenCartsService {
  private loadingCarts: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private cart: BehaviorSubject<ShoppingCartsForTargetType> = new BehaviorSubject(null);
  private shoppingCarts: BehaviorSubject<ShoppingCartsForTargetType[]> = new BehaviorSubject(null);

  searchString = '';
  pageIndex = 0;
  pageLimit = 10;
  posId: string;

  get shoppingCarts$(): Observable<ShoppingCartsForTargetType[]> {
    return this.shoppingCarts.asObservable();
  }
  get loadingCarts$(): Observable<boolean> {
    return this.loadingCarts.asObservable();
  }
  get cart$(): Observable<ShoppingCartsForTargetType> {
    return this.cart.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(private findTargetShoppingCartsGQL: FindTargetShoppingCartsGQL, private storageHelper: StorageHelper) {}

  findTargetShoppingCarts(): Observable<ShoppingCartsForTargetType[]> {
    this.loadingCarts.next(true);
    return this.findTargetShoppingCartsGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingCarts.next(false);
          this.pagination.next({ page: this.pageIndex, size: this.pageLimit, length: data.findTargetShoppingCarts.count });
          this.shoppingCarts.next(data.findTargetShoppingCarts.objects);
          return data.findTargetShoppingCarts.objects;
        }),
      );
  }
  getCartById(id: string): Observable<ShoppingCartsForTargetType> {
    return this.shoppingCarts.pipe(
      take(1),
      map((carts) => {
        const cart = carts.find((item) => item.id === id) || null;
        this.cart.next(cart);
        return cart;
      }),
      switchMap((cart) => {
        if (!cart) {
          return throwError(() => new Error('Could not found order with id of ' + id + '!'));
        }
        return of(cart);
      }),
    );
  }
}
