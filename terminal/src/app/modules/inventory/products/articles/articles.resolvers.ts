import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, combineLatest, of } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import {
  PriceType,
  BarcodeType,
  BarcodePaginateType,
  InternalProductType,
  AttributeValuePaginateType,
  BarcodeWithStockPaginatedType,
} from '@sifca-monorepo/terminal-generator';

import { BarcodeService } from './articles.service';
import { SettingsService } from '../../../system/settings/settings.service';
import { WebsiteService } from '../../../system/apps/apps/website/website.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { ProductsService } from '../products/products.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductType[]> {
    return this.productsService.getInfiniteProducts();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WebsiteResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WebsiteIntegrationType> {
    return this.websiteService.getWebsiteIntegrationByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PriceListResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<PriceType[]> {
    return this.settingsService.getEnabledPricesByCompany();
  }
}

@Injectable({
  providedIn: 'root',
})
export class BarcodesResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodeType[]> {
    return this.barcodeService.getBarcodesByTargetPaginated();
  }
}
@Injectable({
  providedIn: 'root',
})
export class BarcodesWithStockResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodeWithStockPaginatedType> {
    return this.barcodeService.searchSimpleBarcodesByTargetWithStock(true);
  }
}
@Injectable({
  providedIn: 'root',
})
export class BarcodeResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodePaginateType> {
    return this.barcodeService[route.data.action](true);
  }
}
@Injectable({
  providedIn: 'root',
})
export class AttributesResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AttributeValuePaginateType> {
    return this.barcodeService.searchAttributeByTarget(true);
  }
}
@Injectable({
  providedIn: 'root',
})
export class BarcodeDetailsResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodeType | {}> {
    return combineLatest([
      this.barcodeService.getBarcodeStats(route.paramMap.get('id')),
      this.barcodeService.getBarcodeById(route.paramMap.get('id')).pipe(
        catchError((error) => {
          console.error(error);
          const parentUrl = state.url.split('/').slice(0, -1).join('/');
          this.router.navigateByUrl(parentUrl);
          return throwError(() => new Error(error));
        }),
      ),
    ]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AddBarcodeResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodeType | {}> {
    return !route.paramMap.get('id')
      ? of({})
      : this.barcodeService.getBarcodeById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}

@Injectable({
  providedIn: 'root',
})
export class TargetServiceProductResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductType> {
    return this.barcodeService.getTargetServiceProduct().pipe(
      catchError((error) => {
        console.error(error);
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
