import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { EcommerceService } from './ecommerce.service';
import { CorporateEmailTemplateType, OrderSettingsFullType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class EcommerceSettingsResolver implements Resolve<any> {
  constructor(private ecommerceService: EcommerceService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrderSettingsFullType> {
    return this.ecommerceService.getOrderSettings();
  }
}

@Injectable({
  providedIn: 'root',
})
export class EmailsResolver implements Resolve<any> {
  constructor(private ecommerceService: EcommerceService) {}

  resolve(): Observable<CorporateEmailTemplateType[]> {
    return this.ecommerceService.getCorporateEmailsByTargetPaginated();
  }
}
