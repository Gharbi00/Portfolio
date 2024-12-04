import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BrandService } from './brands.service';
import { BrandType } from '@sifca-monorepo/terminal-generator';
import { BrandPaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class BrandResolver implements Resolve<any> {
  constructor(private brandService: BrandService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BrandPaginateType> {
    this.brandService.searchString = '';
    return this.brandService.searchBrand();
  }
}

@Injectable({
  providedIn: 'root',
})
export class BrandDetailsResolver implements Resolve<any> {
  constructor(private brandService: BrandService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BrandType | {}> {
    return route.paramMap.get('id') === 'new-brand'
      ? of({})
      : this.brandService.getBrandById(route.paramMap.get('id')).pipe(
          // Error here means the requested product is not available
          catchError((error) => {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            this.router.navigateByUrl(parentUrl);

            // Throw an error
            return throwError(() => new Error(error));
          }),
        );
  }
}
