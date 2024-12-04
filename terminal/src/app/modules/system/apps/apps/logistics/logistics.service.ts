import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  CompanyInput,
  CompanyType,
  DeleteResponseDtoType,
  GetLogisticsIntegrationByTargetGQL,
  LogisticsIntegrationInput,
  LogisticsIntegrationType,
  UpdateLogisticsIntegrationGQL,
  CreateCompanyGQL,
  DeleteCompanyGQL,
  SearchLogisticCompaniesByTargetGQL,
  UpdateCompanyGQL,
} from '@sifca-monorepo/terminal-generator';
import { findIndex } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class LogisticsService {
  private logistic: BehaviorSubject<LogisticsIntegrationType> = new BehaviorSubject(null);
  private companies: BehaviorSubject<CompanyType[]> = new BehaviorSubject<CompanyType[]>(null);
  private loadingCompanies: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  searchString = '';

  get logistic$(): Observable<LogisticsIntegrationType> {
    return this.logistic.asObservable();
  }

  get companies$(): Observable<CompanyType[]> {
    return this.companies.asObservable();
  }

  get loadingCompanies$(): Observable<boolean> {
    return this.loadingCompanies.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private createCompanyGQL: CreateCompanyGQL,
    private updateCompanyGQL: UpdateCompanyGQL,
    private deleteCompanyGQL: DeleteCompanyGQL,
    private updateLogisticsIntegrationGQL: UpdateLogisticsIntegrationGQL,
    private searchLogisticCompaniesByTargetGQL: SearchLogisticCompaniesByTargetGQL,
    private getLogisticsIntegrationByTargetGQL: GetLogisticsIntegrationByTargetGQL,
  ) {}

  getLogisticsIntegrationByTarget(): Observable<LogisticsIntegrationType> {
    return this.getLogisticsIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.logistic.next(data.getLogisticsIntegrationByTarget);
          return data.getLogisticsIntegrationByTarget;
        }
      }),
    );
  }

  searchLogisticCompaniesByTarget(): Observable<CompanyType[]> {
    this.loadingCompanies.next(true);
    return this.searchLogisticCompaniesByTargetGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, searchString: this.searchString })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingCompanies.next(false);
            this.companies.next(data.searchLogisticCompaniesByTarget.objects);
            return data.searchLogisticCompaniesByTarget.objects;
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
        map(({ data }: any) => {
          if (data) {
            this.companies.next([data.createCompany, ...(this.companies.value || [])]);
            return data.createCompany;
          }
        }),
      );
  }

  updateLogisticsIntegration(id: string, input: LogisticsIntegrationInput): Observable<LogisticsIntegrationType> {
    return this.updateLogisticsIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.logistic.next(data.updateLogisticsIntegration);
          return data.updateLogisticsIntegration;
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
        map(({ data }: any) => {
          if (data) {
            const companies = this.companies.value;
            const index = findIndex(this.companies.value, (a) => a.id === id);
            companies[index] = data.updateCompany;
            this.companies.next(companies);
            return data.updateCompany;
          }
        }),
      );
  }

  deleteLogisticCompany(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCompanyGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const companies = this.companies.value.filter((a) => a.id !== id);
          this.companies.next(companies);
          this.companies.next(this.companies.value);
          return data.deleteCompany;
        }
      }),
    );
  }
}
