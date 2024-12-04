import { Injectable } from '@angular/core';
import { LoyaltyService } from './loyalty.service';
import { Observable, catchError, throwError } from 'rxjs';
import { IntegrationAppsService } from '../../apps.service';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { LoyaltySettingsType, PluginType, ReputationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class LoyaltyResolver implements Resolve<any> {
  constructor(private LoyaltyService: LoyaltyService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LoyaltySettingsType> {
    return this.LoyaltyService.findLoyaltySettingsByTarget();
  }
}
@Injectable({
  providedIn: 'root',
})
export class LoyaltyDetailsResolver implements Resolve<any> {
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

@Injectable({
  providedIn: 'root',
})
export class LoyaltyLevelResolver implements Resolve<any> {
  constructor(private loyaltyService: LoyaltyService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ReputationType[]> {
    return this.loyaltyService.getReputationsByTarget();
  }
}
