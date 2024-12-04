import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, catchError, of, throwError } from 'rxjs';
import { PagesService } from './pages.service';
import { LandingPagesType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class ContentLandingPagesResolver implements Resolve<any> {
  constructor(private pagesService: PagesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LandingPagesType[]> {
    return this.pagesService.findLandingPagesByTargetAndTypeAndStatusPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ContentDetailLandingPagesResolver implements Resolve<any> {
  constructor(private pagesService: PagesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LandingPagesType | {}> {
    return route.paramMap.get('id') === 'new-page'
      ? of({})
      : this.pagesService.landingPageById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
