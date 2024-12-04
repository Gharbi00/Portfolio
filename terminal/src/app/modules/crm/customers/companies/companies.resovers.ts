import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';

import { CompaniesService } from './companies.service';
import { CompanyPaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class CompaniesResolver implements Resolve<any> {
  constructor(private companiesService: CompaniesService) {}

  resolve(): Observable<CompanyPaginateType> {
    return this.companiesService.searchCustomersByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class CompaniesByTargetResolver implements Resolve<any> {
  constructor(private companiesService: CompaniesService) {}

  resolve(): Observable<CompanyPaginateType> {
    return this.companiesService.getCompaniesByTarget(true);
  }
}
