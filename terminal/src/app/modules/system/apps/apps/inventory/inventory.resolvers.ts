import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, catchError, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { InventoryIntegrationType, PluginType } from '@sifca-monorepo/terminal-generator';

import { InventoryService } from './inventory.service';
import { IntegrationAppsService } from '../../apps.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryDetailsResolver implements Resolve<any> {
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
export class InventoryResolver implements Resolve<any> {
  constructor(private inventoryService: InventoryService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InventoryIntegrationType> {
    return this.inventoryService.getInventoryIntegration();
  }
}
