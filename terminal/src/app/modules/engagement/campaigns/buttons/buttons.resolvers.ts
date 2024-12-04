import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { ButtonsService } from './buttons.service';
import { ActivityTypeWithActiveStatusType } from '@sifca-monorepo/terminal-generator';
import { WidgetIntegrationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class ButtonsResolver implements Resolve<any> {
  constructor(private buttonsService: ButtonsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.buttonsService.getPredefinedActivityTypesPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WidgetResolver implements Resolve<any> {
  constructor(private buttonsService: ButtonsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WidgetIntegrationType> {
    return this.buttonsService.getWidgetIntegrationByTarget();
  }
}
