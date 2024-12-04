import { Observable, catchError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { InternalProductWithStockType, ProductClicksType } from '@sifca-monorepo/terminal-generator';

import { ClicksService } from './clicks.service';
import { ProductsService } from '../../../inventory/products/products/products.service';

@Injectable({
  providedIn: 'root',
})
export class ClicksResolver implements Resolve<any> {
  constructor(private clicksService: ClicksService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductClicksType[]> {
    return this.clicksService.findProductClicksByOwnerPaginated();
  }
}
@Injectable({
  providedIn: 'root',
})
export class ClicksDetailsResolver implements Resolve<any> {
  constructor(private productsService: ProductsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductWithStockType | {}> {
    if (route.paramMap.get('id') !== 'edit' && route.paramMap.get('id') !== 'view') {
      return this.productsService.getSimpleProduct(route.paramMap.get('id')).pipe(
        catchError((error) => {
          const parentUrl = state.url.split('/').slice(0, -1).join('/');
          this.router.navigateByUrl(parentUrl);
          return throwError(() => new Error(error));
        }),
      ) as Observable<any>;
    }
  }
}
