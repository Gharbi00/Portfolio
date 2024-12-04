import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { CompanyPaginateType } from '@sifca-monorepo/terminal-generator';
import { BarcodeType, CompanyType } from '@sifca-monorepo/terminal-generator';

import { SupplierService } from './suppliers.service';

@Injectable({
  providedIn: 'root',
})
export class InfiniteSuppliersResolver implements Resolve<any> {
  constructor(private supplierService: SupplierService) {}

  resolve(): Observable<CompanyPaginateType> {
    this.supplierService.suppliersPageIndex = 0;
    this.supplierService.suppliers$ = null;
    return this.supplierService.searchInfiniteSuppliersByTarget();
  }
}
@Injectable({
  providedIn: 'root',
})
export class SupplierResolver implements Resolve<any> {
  constructor(private supplierService: SupplierService) {}

  resolve(): Observable<CompanyPaginateType> {
    return this.supplierService.searchSuppliersByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SupplierDetailsResolver implements Resolve<any> {
  constructor(private supplierService: SupplierService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CompanyType> {
    return this.supplierService.getCompanyById(route.paramMap.get('id')).pipe(
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
export class SupplierProductsResolver implements Resolve<any> {
  constructor(private supplierService: SupplierService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BarcodeType[]> {
    return this.supplierService.searchBarcodesByTargetAndSupplier(route.paramMap.get('id')).pipe(
      catchError((error) => {
        console.error(error);
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
