import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, catchError, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { PluginType } from '@sifca-monorepo/terminal-generator';

import { WidgetService } from './widget.service';
import { IntegrationAppsService } from '../../apps.service';
import { ActivityTypeWithActiveStatusType } from '@sifca-monorepo/terminal-generator';
import { WidgetIntegrationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class WidgetResolver implements Resolve<any> {
  constructor(private widgetService: WidgetService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WidgetIntegrationType> {
    return this.widgetService.getWidgetIntegrationByTarget();
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
export class WidgetActivityResolver implements Resolve<any> {
  constructor(private widgetService: WidgetService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.widgetService.getPredefinedActivityTypesPaginated();
  }
}
