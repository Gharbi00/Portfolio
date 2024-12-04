import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { CompanyType, CustomerPhaseEnum, DeleteResponseDtoType } from '@sifca-monorepo/terminal-generator';
import {
  CompanyGQL,
  CreateCompanyGQL,
  DeleteCompanyGQL,
  UpdateCompanyGQL,
  GetCompaniesByTargetGQL,
  ImportCustomersByExcelGQL,
  GetCustomersTemplateByExcelGQL,
  SearchCustomersByTargetAndPhaseGQL,
  CompanyInput,
  CompanyUpdateInput,
  CompanyPaginateType,
  SuccessResponseDtoType,
  InvoicePdfType,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingLeads: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private isCompanyLast: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingCompanies: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private leads: BehaviorSubject<CompanyType[]> = new BehaviorSubject<CompanyType[]>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private companies: BehaviorSubject<CompanyType[]> = new BehaviorSubject<CompanyType[]>(null);
  private leadsPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private companyPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private infiniteLeads: BehaviorSubject<CompanyType[]> = new BehaviorSubject<CompanyType[]>(null);
  private infiniteCompanies: BehaviorSubject<CompanyType[]> = new BehaviorSubject<CompanyType[]>(null);

  pageIndex = 0;
  leadsLimit = 10;
  filterLimit = 10;
  searchString = '';
  leadsPageIndex = 0;
  searchCustomers = '';

  get companies$(): Observable<CompanyType[]> {
    return this.companies.asObservable();
  }
  get loadingLeads$(): Observable<boolean> {
    return this.loadingLeads.asObservable();
  }
  set companies$(value: any) {
    this.companies.next(value);
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  get isCompanyLast$(): Observable<boolean> {
    return this.isCompanyLast.asObservable();
  }

  get loadingCompanies$(): Observable<boolean> {
    return this.loadingCompanies.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get companyPagination$(): Observable<IPagination> {
    return this.companyPagination.asObservable();
  }

  get leadsPagination$(): Observable<IPagination> {
    return this.leadsPagination.asObservable();
  }

  get leads$(): Observable<CompanyType[]> {
    return this.leads.asObservable();
  }
  set leads$(value: any) {
    this.leads.next(value);
  }

  get infiniteLeads$(): Observable<CompanyType[]> {
    return this.infiniteLeads.asObservable();
  }
  set infiniteLeads$(value: any) {
    this.infiniteLeads.next(value);
  }

  get infiniteCompanies$(): Observable<CompanyType[]> {
    return this.infiniteCompanies.asObservable();
  }
  set infiniteCompanies$(value: any) {
    this.infiniteCompanies.next(value);
  }

  constructor(
    private companyGQL: CompanyGQL,
    private storageHelper: StorageHelper,
    private createCompanyGQL: CreateCompanyGQL,
    private updateCompanyGQL: UpdateCompanyGQL,
    private deleteCompanyGQL: DeleteCompanyGQL,
    private getCompaniesByTargetGQL: GetCompaniesByTargetGQL,
    private importCustomersByExcelGQL: ImportCustomersByExcelGQL,
    private getCustomersTemplateByExcelGQL: GetCustomersTemplateByExcelGQL,
    private searchCustomersByTargetAndPhaseGQL: SearchCustomersByTargetAndPhaseGQL,
  ) {}

  searchCustomersByTarget(): Observable<CompanyPaginateType> {
    this.loadingCompanies.next(true);
    return this.searchCustomersByTargetAndPhaseGQL
      .fetch({
        phase: CustomerPhaseEnum.CUSTOMER,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        searchString: this.searchCustomers,
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.loadingCompanies.next(false);
            this.infiniteCompanies.next([...(this.infiniteCompanies?.value || []), ...data.searchCustomersByTargetAndPhase.objects]);
            this.companies.next(data.searchCustomersByTargetAndPhase.objects);
            this.isCompanyLast.next(data.searchCustomersByTargetAndPhase.isLast);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.searchCustomersByTargetAndPhase?.count,
            });
            return data.searchCustomersByTargetAndPhase;
          }
        }),
      );
  }

  importCustomersByExcel(base64: string): Observable<SuccessResponseDtoType> {
    return this.importCustomersByExcelGQL
      .mutate({
        base64,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          return data.importCustomersByExcel;
        }),
      );
  }

  getCustomersTemplateByExcel(): Observable<InvoicePdfType> {
    return this.getCustomersTemplateByExcelGQL.fetch({}).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getCustomersTemplateByExcel.content;
        }
      }),
    );
  }

  getCompaniesByTarget(reset: boolean = false): Observable<CompanyPaginateType> {
    this.loadingCompanies.next(true);
    if (reset) {
      this.leadsPageIndex = 0;
      this.infiniteLeads.next([]);
    }
    return this.getCompaniesByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.leadsPageIndex, limit: this.leadsLimit },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.isLast.next(data.getCompaniesByTarget.isLast);
            this.infiniteLeads.next([...(this.infiniteLeads?.value || []), ...data.getCompaniesByTarget.objects]);
            this.loadingCompanies.next(false);
            return data.getCompaniesByTarget;
          }
        }),
      );
  }

  createCustomerCompany(input: CompanyInput): Observable<CompanyType> {
    return this.createCompanyGQL
      .mutate({
        input: {
          ...input,
          target: { pos: this.storageHelper.getData('posId') },
          customer: { phase: CustomerPhaseEnum.CUSTOMER },
        },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.companies.next([data.createCompany, ...this.companies.value]);
            return data.createCompany;
          }
        }),
      );
  }

  createLeadCompany(input: CompanyInput): Observable<CompanyType> {
    return this.createCompanyGQL
      .mutate({
        input: {
          ...input,
          target: { pos: this.storageHelper.getData('posId') },
          customer: {
            ...input?.customer,
            phase: CustomerPhaseEnum.LEAD,
          },
        },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.leads.next([data.createCompany, ...this.leads.value]);
            return data.createCompany;
          }
        }),
      );
  }

  deleteLeadCompany(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCompanyGQL.mutate({ id }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const leads = this.leads.value.filter((a) => a.id !== id);
          this.leads.next(leads);
          return data.deleteCompany;
        }
      }),
    );
  }

  deleteCustomerCompany(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCompanyGQL.mutate({ id }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const companies = this.companies.value.filter((a) => a.id !== id);
          this.companies.next(companies);
          return data.deleteCompany;
        }
      }),
    );
  }

  updateCustomerCompany(input: CompanyUpdateInput, id: string): Observable<CompanyType> {
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
            const index = this.companies.value.map((a) => a.id).indexOf(id);
            const companies = this.companies.value;
            companies[index] = data.updateCompany;
            this.companies.next(companies);
            return data.updateCompany;
          }
        }),
      );
  }

  updateLeadCompany(input: CompanyUpdateInput, id: string): Observable<CompanyType> {
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
            const index = this.leads.value.map((a) => a.id).indexOf(id);
            const leads = this.leads.value;
            leads[index] = data.updateCompany;
            this.leads.next(leads);
            return data.updateCompany;
          }
        }),
      );
  }

  getCompany(id: string): Observable<CompanyType> {
    return this.companyGQL.fetch({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.companies.next(response.data.company);
          return response.data.company;
        }
      }),
    );
  }

  searchLeadsByTarget(): Observable<CompanyPaginateType> {
    this.loadingLeads.next(true);
    return this.searchCustomersByTargetAndPhaseGQL
      .fetch({
        phase: CustomerPhaseEnum.LEAD,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.leadsPageIndex, limit: this.leadsLimit },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.leadsPagination.next({
              page: this.leadsPageIndex,
              size: this.leadsLimit,
              length: data.searchCustomersByTargetAndPhase?.count,
            });
            this.loadingLeads.next(false);
            this.infiniteLeads.next([...(this.infiniteLeads?.value || []), ...data.searchCustomersByTargetAndPhase.objects]);
            this.isLast.next(data.searchCustomersByTargetAndPhase.isLast);
            this.leads.next(data.searchCustomersByTargetAndPhase.objects);
            return data.searchCustomersByTargetAndPhase;
          }
        }),
      );
  }

  createCompany(input: CompanyInput): Observable<CompanyType> {
    return this.createCompanyGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.companies.next(response.data.createCompany);
          return response.data.createCompany;
        }
      }),
    );
  }

  updateCompany(id: string, input: CompanyInput): Observable<CompanyType> {
    return this.updateCompanyGQL.mutate({ id, input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.companies.next(response.data.updateCompany);
          return response.data.updateCompany;
        }
      }),
    );
  }

  deleteCompany(id: string): Observable<CompanyType> {
    return this.deleteCompanyGQL.mutate({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.companies.next(response.data.deleteCompany);
          return response.data.deleteCompany;
        }
      }),
    );
  }
}
