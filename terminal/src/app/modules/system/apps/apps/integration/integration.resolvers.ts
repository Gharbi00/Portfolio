import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { IntegrationService } from './integration.service';
import { IntegrationIntegrationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class IntegrationResolver implements Resolve<any> {
  constructor(private integrationService: IntegrationService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IntegrationIntegrationType> {
    return this.integrationService.getIntegrationIntegrationByTarget();
  }
}
