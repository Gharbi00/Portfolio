import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { FbPixelType, PluginType } from '@sifca-monorepo/terminal-generator';
import { IntegrationAppsService } from '../../../apps.service';

@Injectable({
  providedIn: 'root',
})
export class PixelResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FbPixelType> {
    return this.integrationAppsService.getFBPixelByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PixelDetailsResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService, private router: Router, private location: Location) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PluginType> {
    return this.integrationAppsService.findPluginByURL(this.location.path()).pipe(
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
export class CatalogueDetailsResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PluginType> {
    const currentUrl = state.url;
    return this.integrationAppsService.findPluginByURL(currentUrl).pipe(
      catchError((error) => {
        console.error(error);
        const parentUrl = currentUrl.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
