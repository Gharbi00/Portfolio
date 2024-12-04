import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { ErpIntegrationType, PluginType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../apps.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ErpIntegrationType> {
    return this.integrationAppsService.getErpIntegrationByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PluginResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PluginType> {
    const currentUrl = state.url;
    return this.integrationAppsService.findPluginByURL(currentUrl).pipe(
      catchError((error) => {
        const parentUrl = currentUrl.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
