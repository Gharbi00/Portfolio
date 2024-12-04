import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of, switchMap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { BrandPaginateType, TaxType, UserType } from '@sifca-monorepo/terminal-generator';
import { InternalProductType, ProductAttributeType, CatalogueCategoryType, InternalProductWithStockType } from '@sifca-monorepo/terminal-generator';

import { ProductsService } from './products.service';
import { BrandService } from '../../brands/brands.service';
import { SettingsService } from '../../../system/settings/settings.service';
import { InventoryService } from '../../../../shared/services/inventory.service';

@Injectable({
  providedIn: 'root',
})
export class InfiniteProductsResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductType[]> {
    return this.productsService[route.data.dropDownAction](true);
  }
}
@Injectable({
  providedIn: 'root',
})
export class ProductsResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductType[]> {
    return this.productsService[route.data.action](true);
  }
}
@Injectable({
  providedIn: 'root',
})
export class BrandResolver implements Resolve<any> {
  constructor(private brandService: BrandService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BrandPaginateType> {
    this.brandService.infinteBrands$ = null;
    this.brandService.searchString = '';
    this.brandService.pageIndex = 0;
    return this.brandService.searchBrand();
  }
}
@Injectable({
  providedIn: 'root',
})
export class UsersResolver implements Resolve<any> {
  constructor(private productsService: ProductsService, private inventoryService: InventoryService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserType[][]> {
    this.productsService.ownersPageIndex = 0;
    this.productsService.techniciansPageIndex = 0;
    this.inventoryService.pageId$
      .pipe(
        switchMap((pageId) => {
          if (pageId === 'equipments-articles') {
            return forkJoin([this.productsService.getOwners(), this.productsService.getTechnicians()]);
          } return of(null);
        }),
      )
      .subscribe();
    return of(null);
  }
}
@Injectable({
  providedIn: 'root',
})
export class SettingsResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TaxType[]> {
    return this.settingsService.getTaxesByCompany();
  }
}
@Injectable({
  providedIn: 'root',
})
export class ProductsCategoriesResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CatalogueCategoryType[]> {
    return this.productsService.getCatalogueCategoriesByTargetWithChildren();
    // return this.productsService.getCategories(1);
  }
}
@Injectable({
  providedIn: 'root',
})
export class ProductAttributesResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductAttributeType[]> {
    return this.productsService.getProductAttributes();
  }
}
@Injectable({
  providedIn: 'root',
})
export class SearchProductsResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductType[]> {
    return this.productsService.searchInternalProduct('');
  }
}
@Injectable({
  providedIn: 'root',
})
export class ResetSimpleProductResolver implements Resolve<any> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.productsService.resetSimpleProduct();
  }
}
@Injectable({
  providedIn: 'root',
})
export class ProductDetailsResolver implements Resolve<any> {
  constructor(private productsService: ProductsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductWithStockType | {}> {
    if (route.paramMap.get('id') !== 'edit' && route.paramMap.get('id') !== 'view') {
      return this.productsService[route.data.action](route.paramMap.get('id')).pipe(
        catchError((error) => {
          const parentUrl = state.url.split('/').slice(0, -1).join('/');
          this.router.navigateByUrl(parentUrl);
          return throwError(() => new Error(error));
        }),
      ) as Observable<any>;
    }
  }
}
