import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { CompanyType, DeleteResponseDtoType, PriceType, TaxType } from '@sifca-monorepo/terminal-generator';
import {
  TaxInput,
  PriceInput,
  CompanyInput,
  CreateTaxGQL,
  DeleteTaxGQL,
  UpdateTaxGQL,
  UpdatePriceGQL,
  CreatePriceGQL,
  TaxPaginateType,
  CreateCompanyGQL,
  DeleteCompanyGQL,
  UpdateCompanyGQL,
  CompanyPaginateType,
  GetTaxesByCompanyGQL,
  WarehousePaginateType,
  GetEnabledPricesByCompanyGQL,
  GetTaxesByCompanyPaginatedGQL,
  GetPricesByCompanyPaginatedGQL,
  GetGlobalSalesTaxesByCompanyGQL,
  GetProductSalesTaxesByCompanyGQL,
  GetWarehousesByCompanyPaginatedGQL,
  SearchLogisticCompaniesByTargetGQL,
  GetGlobalPurchasesTaxesByCompanyGQL,
  GetProductPurchasesTaxesByCompanyGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private priceList: BehaviorSubject<PriceType[]> = new BehaviorSubject<PriceType[]>(null);
  private allTaxes: BehaviorSubject<TaxType[]> = new BehaviorSubject<TaxType[]>(null);
  private globalTaxes: BehaviorSubject<TaxType[]> = new BehaviorSubject<TaxType[]>(null);
  private company: BehaviorSubject<CompanyType> = new BehaviorSubject<CompanyType>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private taxes: BehaviorSubject<TaxPaginateType> = new BehaviorSubject<TaxPaginateType>(null);
  private visibleGlobalTaxes: BehaviorSubject<TaxType[]> = new BehaviorSubject<TaxType[]>(null);
  private settings: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private companies: BehaviorSubject<CompanyPaginateType> = new BehaviorSubject<CompanyPaginateType>(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  pricePageIndex = 0;
  pricePageLimit = 10;
  priceSearchString = '';

  get company$(): Observable<CompanyType> {
    return this.company.asObservable();
  }

  get settings$(): Observable<any> {
    return this.settings.asObservable();
  }
  get allTaxes$(): Observable<TaxType[]> {
    return this.allTaxes.asObservable();
  }
  get visibleGlobalTaxes$(): Observable<TaxType[]> {
    return this.visibleGlobalTaxes.asObservable();
  }
  set visibleGlobalTaxes$(value: any) {
    this.visibleGlobalTaxes.next(value);
  }
  get globalTaxes$(): Observable<TaxType[]> {
    return this.globalTaxes.asObservable();
  }
  get taxes$(): Observable<TaxPaginateType> {
    return this.taxes.asObservable();
  }
  get companies$(): Observable<CompanyPaginateType> {
    return this.companies.asObservable();
  }
  get priceList$(): Observable<PriceType[]> {
    return this.priceList.asObservable();
  }

  constructor(
    private createTaxGQL: CreateTaxGQL,
    private deleteTaxGQL: DeleteTaxGQL,
    private updateTaxGQL: UpdateTaxGQL,
    private storageHelper: StorageHelper,
    private updatePriceGQL: UpdatePriceGQL,
    private createPriceGQL: CreatePriceGQL,
    private createCompanyGQL: CreateCompanyGQL,
    private deleteCompanyGQL: DeleteCompanyGQL,
    private updateCompanyGQL: UpdateCompanyGQL,
    private getTaxesByCompanyGQL: GetTaxesByCompanyGQL,
    private getEnabledPricesByCompanyGQL: GetEnabledPricesByCompanyGQL,
    private getTaxesByCompanyPaginatedGQL: GetTaxesByCompanyPaginatedGQL,
    private getPricesByCompanyPaginatedGQL: GetPricesByCompanyPaginatedGQL,
    private getGlobalSalesTaxesByCompanyGQL: GetGlobalSalesTaxesByCompanyGQL,
    private getProductSalesTaxesByCompanyGQL: GetProductSalesTaxesByCompanyGQL,
    private getWarehousesByCompanyPaginatedGQL: GetWarehousesByCompanyPaginatedGQL,
    private searchLogisticCompaniesByTargetGQL: SearchLogisticCompaniesByTargetGQL,
    private getGlobalPurchasesTaxesByCompanyGQL: GetGlobalPurchasesTaxesByCompanyGQL,
    private getProductPurchasesTaxesByCompanyGQL: GetProductPurchasesTaxesByCompanyGQL,
  ) {}

  getPricesByCompanyPaginated(): Observable<PriceType[]> {
    return this.getPricesByCompanyPaginatedGQL
      .fetch({
        company: this.storageHelper.getData('company'),
        pagination: { page: this.pricePageIndex, limit: this.pricePageLimit },
        searchString: this.priceSearchString,
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.priceList.next(data.getPricesByCompanyPaginated.objects);
            return data.getPricesByCompanyPaginated.objects;
          }
        }),
      );
  }

  getEnabledPricesByCompany(): Observable<PriceType[]> {
    return this.getEnabledPricesByCompanyGQL
      .fetch({
        company: this.storageHelper.getData('company'),
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.priceList.next(data.getEnabledPricesByCompany);
            return data.getEnabledPricesByCompany;
          }
        }),
      );
  }

  updatePrice(id: string, input: PriceInput): Observable<PriceType> {
    return this.updatePriceGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const priceList = this.priceList.value;
          const index = priceList?.findIndex((a) => a.id === id);
          priceList[index] = data.updatePrice;
          this.priceList.next(priceList);
          return data.updatePrice;
        }
      }),
    );
  }

  createPrice(input: PriceInput): Observable<PriceType> {
    return this.createPriceGQL.mutate({ input: { ...input, company: this.storageHelper.getData('company') } }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.priceList.next([data.createPrice, ...this.priceList.value]);
          return data.createPrice;
        }
      }),
    );
  }

  getCompanySettingsByCompany(): Observable<any> {
    return of(null);
  }

  getWarehousesByCompanyPaginated(): Observable<WarehousePaginateType> {
    return this.getWarehousesByCompanyPaginatedGQL
      .fetch({
        company: this.storageHelper.getData('company'),
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getWarehousesByCompanyPaginated?.count,
          });
          // this.warehouses.next(data.getWarehousesByCompanyPaginated.objects);
          return data.getWarehousesByCompanyPaginated;
        }),
      ) as Observable<any>;
  }

  getTaxesByCompanyPaginated(): Observable<TaxPaginateType> {
    return this.getTaxesByCompanyPaginatedGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.taxes.next(data.getTaxesByCompanyPaginated);
          return data.getTaxesByCompanyPaginated;
        }
      }),
    );
  }

  getProductSalesTaxesByCompany(): Observable<TaxType[]> {
    return this.getProductSalesTaxesByCompanyGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.allTaxes.next(data.getProductSalesTaxesByCompany);
          return data.getProductSalesTaxesByCompany;
        }
      }),
    );
  }

  getGlobalSalesTaxesByCompany(): Observable<TaxType[]> {
    return this.getGlobalSalesTaxesByCompanyGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.globalTaxes.next(data.getGlobalSalesTaxesByCompany);
          this.visibleGlobalTaxes.next(data.getGlobalSalesTaxesByCompany);
          return data.getGlobalSalesTaxesByCompany;
        }
      }),
    );
  }

  getProductPurchasesTaxesByCompany(): Observable<TaxType[]> {
    return this.getProductPurchasesTaxesByCompanyGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.allTaxes.next(data.getProductPurchasesTaxesByCompany);
          return data.getProductPurchasesTaxesByCompany;
        }
      }),
    );
  }

  getGlobalPurchasesTaxesByCompany(): Observable<TaxType[]> {
    return this.getGlobalPurchasesTaxesByCompanyGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.globalTaxes.next(data.getGlobalPurchasesTaxesByCompany);
          this.visibleGlobalTaxes.next(data.getGlobalPurchasesTaxesByCompany);
          return data.getGlobalPurchasesTaxesByCompany;
        }
      }),
    );
  }

  getTaxesByCompany(): Observable<TaxType[]> {
    return this.getTaxesByCompanyGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.allTaxes.next(data.getTaxesByCompany);
          return data.getTaxesByCompany;
        }
      }),
    );
  }

  searchLogisticCompaniesByTarget(): Observable<CompanyPaginateType> {
    return this.searchLogisticCompaniesByTargetGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, searchString: this.searchString })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.companies.next(data.searchLogisticCompaniesByTarget);
            return data.searchLogisticCompaniesByTarget;
          }
        }),
      );
  }

  createLogisticCompany(input: CompanyInput): Observable<CompanyType> {
    return this.createCompanyGQL
      .mutate({
        input: {
          ...input,
          target: { pos: this.storageHelper.getData('posId') },
          logistic: true,
        },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.companies.value.objects = [data.createCompany, ...this.companies.value.objects];
            this.companies.next(this.companies.value);
            return data.createCompany;
          }
        }),
      );
  }

  updateLogisticCompany(input: CompanyInput, id: string): Observable<CompanyType> {
    return this.updateCompanyGQL
      .mutate({
        id,
        input: {
          ...input,
        },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            const index = this.companies.value!.objects.map((a) => a.id).indexOf(id);
            const companies = this.companies.value.objects;
            companies[index] = data.updateCompany;
            this.companies.value.objects = companies;
            this.companies.next(this.companies.value);
            return data.updateCompany;
          }
        }),
      );
  }

  deleteLogisticCompany(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCompanyGQL.mutate({ id }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const companies = this.companies.value!.objects.filter((a) => a.id !== id);
          this.companies.value.objects = companies;
          this.companies.next(this.companies.value);
          return data.deleteCompany;
        }
      }),
    );
  }

  updateCompanySettings(id: string, input: any): Observable<any> {
    return of(null);
  }

  createTax(input: TaxInput): Observable<TaxType> {
    return this.createTaxGQL.mutate({ input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.taxes.value.objects = [data.createTax, ...this.taxes.value.objects];
          this.taxes.next(this.taxes.value);
          return data.createTax;
        }
      }),
    );
  }

  updateTax(id: string, input: TaxInput): Observable<TaxType> {
    return this.updateTaxGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const index = this.taxes.value!.objects.map((a) => a.id).indexOf(id);
          const taxes = this.taxes.value.objects;
          taxes[index] = data.updateTax;
          this.taxes.value.objects = taxes;
          this.taxes.next(this.taxes.value);
          return data.updateTax;
        }
      }),
    );
  }

  deleteTax(id: string): Observable<TaxType> {
    return this.deleteTaxGQL.mutate({ id }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const taxes = this.taxes.value!.objects.filter((a) => a.id !== id);
          this.taxes.value.objects = taxes;
          this.taxes.next(this.taxes.value);
          return data.deleteTax;
        }
      }),
    );
  }
}
