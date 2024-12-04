import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';

import { CompaniesService } from '../companies/companies.service';
import { CompanyPaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class LeadsResolver implements Resolve<any> {
  constructor(private companiesService: CompaniesService) {}

  resolve(): Observable<CompanyPaginateType> {
    return this.companiesService.searchLeadsByTarget();
  }
}
