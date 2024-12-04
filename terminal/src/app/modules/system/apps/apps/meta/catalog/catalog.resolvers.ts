import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { FbCatalogSyncType, PluginType } from '@sifca-monorepo/terminal-generator';
import { IntegrationAppsService } from '../../../apps.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogueResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FbCatalogSyncType> {
    return this.integrationAppsService.getFBCatalogSyncByTarget();
  }
}
@Injectable({
  providedIn: 'root',
})
export class CatalogueDetailsResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService, private router: Router, private location: Location) {}

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
