import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { SalesIntegrationType } from '@sifca-monorepo/terminal-generator';

import { SalesService } from './sales.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsResolver implements Resolve<any> {
  constructor(private salesService: SalesService) {}

  resolve(): Observable<SalesIntegrationType> {
    return this.salesService.getSalesIntegrationByTarget();
  }
}
