import { catchError, Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { BarcodePaginateType, PromotionPaginateType } from '@sifca-monorepo/terminal-generator';

import { PromotionsService } from './promotions.service';
import { PromotionType } from '@sifca-monorepo/terminal-generator';
import { BarcodeService } from '../../../inventory/products/articles/articles.service';

@Injectable({
  providedIn: 'root',
})
export class PromotionsResolver implements Resolve<any> {
  constructor(private promotionsService: PromotionsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PromotionPaginateType> {
    return this.promotionsService.getPromotionsByTargetPagination();
  }
}
@Injectable({
  providedIn: 'root',
})
export class PromotionsBarcodesResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodePaginateType> {
    return this.barcodeService.getBarcodesWithVarietyFilter();
  }
}
@Injectable({
  providedIn: 'root',
})
export class PromotionResolver implements Resolve<any> {
  constructor(private promotionsService: PromotionsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PromotionType | {}> {
    return route.paramMap.get('id') === 'new-promotion'
      ? of({})
      : this.promotionsService.getPromotionById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
