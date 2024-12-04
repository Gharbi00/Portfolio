import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { HelpdeskIntegrationType } from '@sifca-monorepo/terminal-generator';

import { HelpdeskService } from './helpdesk.service';

@Injectable({
  providedIn: 'root',
})
export class HelpdeskActivityResolver implements Resolve<any> {
  constructor(private helpdeskService: HelpdeskService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HelpdeskIntegrationType> {
    return this.helpdeskService.getHelpdeskIntegrationByTarget();
  }
}
