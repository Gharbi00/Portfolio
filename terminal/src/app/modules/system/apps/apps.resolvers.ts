import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { IntegrationAppsService } from './apps.service';

@Injectable({
  providedIn: 'root',
})
export class AppsResolver implements Resolve<any> {
  constructor(private integrationAppsService: IntegrationAppsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
    return this.integrationAppsService.findPluginsWithAddedStatus();
  }
}
