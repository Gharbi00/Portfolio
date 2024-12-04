import { catchError, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoyaltyService } from './../loyalty/loyalty.service';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { LoyaltySettingsType, PluginType } from '@sifca-monorepo/terminal-generator';
import { IntegrationAppsService } from '../../apps.service';

@Injectable({
  providedIn: 'root',
})
export class KycResolver implements Resolve<any> {
  constructor(private LoyaltyService: LoyaltyService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LoyaltySettingsType> {
    return this.LoyaltyService.findLoyaltySettingsByTarget();
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
        console.error(error);
        const parentUrl = currentUrl.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
