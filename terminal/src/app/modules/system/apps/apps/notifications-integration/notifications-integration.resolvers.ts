import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, catchError, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { NotificationIntegrationType, PluginType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../apps.service';
import { NotificationIntegrationService } from './notifications-integration.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationResolver implements Resolve<any> {
  constructor(private notificationIntegrationService: NotificationIntegrationService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<NotificationIntegrationType> {
    return this.notificationIntegrationService.getNotificationIntegrationByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WidgetDetailsResolver implements Resolve<any> {
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
