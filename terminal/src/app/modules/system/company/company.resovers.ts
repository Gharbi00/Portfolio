import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { CompanyType } from '@sifca-monorepo/terminal-generator';

import { CompanyService } from './company.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyResolver implements Resolve<any> {
  constructor(private companyService: CompanyService) {}

  resolve(): Observable<CompanyType> {
    return this.companyService.getCompany();
  }
}
