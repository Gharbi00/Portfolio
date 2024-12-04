import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { PriceType, TaxType } from '@sifca-monorepo/terminal-generator';

import { SettingsService } from './settings.service';
import { CompanyPaginateType, TaxPaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class SettingsResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<any> {
    return this.settingsService.getCompanySettingsByCompany();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PriceListResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<PriceType[]> {
    return this.settingsService.getPricesByCompanyPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProductSalesTaxResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<TaxType[]> {
    return this.settingsService.getProductSalesTaxesByCompany();
  }
}
@Injectable({
  providedIn: 'root',
})
export class ProductPurchasesTaxResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<TaxType[]> {
    return this.settingsService.getGlobalPurchasesTaxesByCompany();
  }
}
@Injectable({
  providedIn: 'root',
})
export class GlobalSalesTaxesResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<TaxType[]> {
    return this.settingsService.getGlobalSalesTaxesByCompany();
  }
}
@Injectable({
  providedIn: 'root',
})
export class GlobalPurchasesTaxesResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<TaxType[]> {
    return this.settingsService.getGlobalPurchasesTaxesByCompany();
  }
}
@Injectable({
  providedIn: 'root',
})
export class TaxResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<TaxPaginateType> {
    return this.settingsService.getTaxesByCompanyPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class LogisticCompaniesResolver implements Resolve<any> {
  constructor(private settingsService: SettingsService) {}

  resolve(): Observable<CompanyPaginateType> {
    return this.settingsService.searchLogisticCompaniesByTarget();
  }
}
