import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { InvoicingService } from './invoicing.service';
import { TaxType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class InvoicingResolver implements Resolve<any> {
  constructor(private invoicingService: InvoicingService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TaxType[]> {
    return this.invoicingService.getTaxesByCompanyPaginated();
  }
}
