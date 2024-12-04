import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { BankDetailsType, CompanyGQL, CompanyType, CompanyInput, CreateCompanyGQL, UpdateCompanyGQL } from '@sifca-monorepo/terminal-generator';
import { InvoicingService } from '../../shared/services/invoicing.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private company: BehaviorSubject<CompanyType> = new BehaviorSubject<CompanyType>(null);
  private selectedCustomer: BehaviorSubject<CompanyType> = new BehaviorSubject<CompanyType>(null);
  private loadingSelectedCustomer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private selectedBank: BehaviorSubject<BankDetailsType> = new BehaviorSubject<BankDetailsType>(null);

  get company$(): Observable<CompanyType> {
    return this.company.asObservable();
  }
  get selectedCustomer$(): Observable<CompanyType> {
    return this.selectedCustomer.asObservable();
  }
  set selectedCustomer$(value: any) {
    this.selectedCustomer.next(value);
  }
  get selectedBank$(): Observable<BankDetailsType> {
    return this.selectedBank.asObservable();
  }
  set selectedBank$(value: any) {
    this.selectedBank.next(value);
  }
  get loadingSelectedCustomer$(): Observable<boolean> {
    return this.loadingSelectedCustomer.asObservable();
  }
  set loadingSelectedCustomer$(value: any) {
    this.loadingSelectedCustomer.next(value);
  }

  constructor(
    private companyGQL: CompanyGQL,
    private storageHelper: StorageHelper,
    private createCompanyGQL: CreateCompanyGQL,
    private invoicingService: InvoicingService,
    private updateCompanyGQL: UpdateCompanyGQL,
  ) {}

  getCompanyById(id: string): Observable<CompanyType> {
    this.loadingSelectedCustomer.next(true);
    this.invoicingService.loadingSelectedCustomerSupplier$ = true;
    return this.companyGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.selectedCustomer.next(data.company);
          this.loadingSelectedCustomer.next(false);
          this.invoicingService.loadingSelectedCustomerSupplier$ = false;
          this.invoicingService.selectedCustomerSupplier$ = data.company;
          return data.company;
        }
      }),
    );
  }

  getCompany(): Observable<CompanyType> {
    return this.companyGQL.fetch({ id: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.company.next(data.company);
          if (data.company.banks?.length) {
            this.selectedBank.next(data.company.banks[0]);
          }
          return data.company;
        }
      }),
    );
  }

  updateCompanySettings(): Observable<any> {
    return of(null);
  }

  createCompany(input: CompanyInput): Observable<CompanyType> {
    return this.createCompanyGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.company.next(data.createCompany);
          return data.createCompany;
        }
      }),
    );
  }

  updateCompany(input: CompanyInput): Observable<CompanyType> {
    return this.updateCompanyGQL.mutate({ id: this.storageHelper.getData('company'), input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.company.next(data.updateCompany);
          return data.updateCompany;
        }
      }),
    );
  }
}
