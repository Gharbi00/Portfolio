import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { SmsIntegrationType } from '@sifca-monorepo/terminal-generator';

import { SmsIntegrationService } from './sms-integration.service';

@Injectable({
  providedIn: 'root',
})
export class SmsIntegrationResolver implements Resolve<any> {
  constructor(private smsIntegrationService: SmsIntegrationService) {}

  resolve(): Observable<SmsIntegrationType> {
    return this.smsIntegrationService.getSmsIntegrationByTarget();
  }
}
