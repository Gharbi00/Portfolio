import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { CompanyType, LogisticsIntegrationType } from '@sifca-monorepo/terminal-generator';

import { LogisticsService } from './logistics.service';

@Injectable({
  providedIn: 'root',
})
export class LogisticsResolver implements Resolve<any> {
  constructor(private logisticsService: LogisticsService) {}

  resolve(): Observable<LogisticsIntegrationType> {
    return this.logisticsService.getLogisticsIntegrationByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class LogisticCompaniesResolver implements Resolve<any> {
  constructor(private logisticsService: LogisticsService) {}

  resolve(): Observable<CompanyType[]> {
    return this.logisticsService.searchLogisticCompaniesByTarget();
  }
}
