import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { EmailIntegrationType } from '@sifca-monorepo/terminal-generator';

import { EmailIntegrationService } from './email-integration.service';

@Injectable({
  providedIn: 'root',
})
export class EmailIntegrationResolver implements Resolve<any> {
  constructor(private emailIntegrationService: EmailIntegrationService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<EmailIntegrationType> {
    return this.emailIntegrationService.getEmailIntegrationByTarget();
  }
}
