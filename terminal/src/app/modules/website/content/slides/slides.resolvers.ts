import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SlidesType } from '@sifca-monorepo/terminal-generator';
import { Observable, catchError, of, throwError } from 'rxjs';
import { SlidesService } from './slides.service';
import { WebsiteService } from '../../../system/apps/apps/website/website.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class SlidesResolver implements Resolve<any> {
  constructor(private slidesService: SlidesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SlidesType[]> {
    return this.slidesService.getSlides();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SlidesDetailsResolver implements Resolve<any> {
  constructor(private slidesService: SlidesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SlidesType | {}> {
    return route.paramMap.get('id') === 'new-slide'
      ? of({})
      : this.slidesService.findSlideByTargetAndReference(route.paramMap.get('id')).pipe(
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
export class TranslationResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WebsiteIntegrationType> {
    return this.websiteService.getWebsiteIntegrationByTarget();
  }
}
