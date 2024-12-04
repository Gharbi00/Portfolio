import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { CatalogueCategoryType } from '@sifca-monorepo/terminal-generator';

import { CategoriesService } from './categories.service';
import { ICatalogueCategoryTreeType } from './categories.types';

@Injectable({
  providedIn: 'root',
})
export class CategoriesResolver implements Resolve<any> {
  constructor(private categoriesService: CategoriesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICatalogueCategoryTreeType[]> {
    return this.categoriesService.getCategories(1, null, true);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CategoryResolver implements Resolve<any> {
  constructor(private categoriesService: CategoriesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CatalogueCategoryType | {}> {
    return route.paramMap.get('id').split('?')[0] === 'new'
      ? of({})
      : this.categoriesService.catalogueCategory(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
