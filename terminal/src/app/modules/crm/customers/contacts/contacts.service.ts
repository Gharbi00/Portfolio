import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  CompanyContactGQL,
  CreateCompanyContactGQL,
  DeleteCompanyContactGQL,
  GetCompanyContactsByCompanyPaginatedGQL,
  UpdateCompanyContactGQL,
  CompanyContactInput,
  CompanyContactPaginateType,
  CompanyContactType, DeleteResponseDtoType
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private loadingContacts: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private contacts: BehaviorSubject<CompanyContactType[]> = new BehaviorSubject(null);

  company: string;
  pageIndex = 0;
  filterLimit = 10;
  searchString = '';

  constructor(
    private storageHelper: StorageHelper,
    private companyContactGQL: CompanyContactGQL,
    private getCompanyContactsByCompanyPaginatedGQL: GetCompanyContactsByCompanyPaginatedGQL,
    private createCompanyContactGQL: CreateCompanyContactGQL,
    private updateCompanyContactGQL: UpdateCompanyContactGQL,
    private deleteCompanyContactGQL: DeleteCompanyContactGQL,
  ) {
    this.company = this.storageHelper.getData('company');
  }

  get loadingContacts$(): Observable<boolean> {
    return this.loadingContacts.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get contacts$(): Observable<CompanyContactType[]> {
    return this.contacts.asObservable();
  }
  get customer() {
    return this.contacts;
  }

  companyContact(id: string): Observable<CompanyContactType> {
    return this.companyContactGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        return data.getProjectsByTarget;
      }),
    );
  }

  getCompanyContactsByCompanyPaginated(): Observable<CompanyContactPaginateType> {
    this.loadingContacts.next(true);
    return this.getCompanyContactsByCompanyPaginatedGQL
      .fetch({ company: this.company, searchString: this.searchString, pagination: { page: this.pageIndex, limit: this.filterLimit } })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.loadingContacts.next(false);
            this.contacts.next(data.getCompanyContactsByCompanyPaginated.objects);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.getCompanyContactsByCompanyPaginated?.count,
            });
            return data.getCompanyContactsByCompanyPaginated;
          }
        }),
      );
  }

  createCompanyContact(input: CompanyContactInput): Observable<CompanyContactType> {
    return this.createCompanyContactGQL.mutate({ input: { ...input, company: this.company } }).pipe(
      map(({ data }: any) => {
        this.contacts.next([data.createCompanyContact, ...this.contacts.value]);
        return data.createCompanyContact;
      }),
    );
  }

  updateCompanyContact(id: string, input: CompanyContactInput): Observable<CompanyContactType> {
    return this.updateCompanyContactGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        const index = this.contacts.value.map((a) => a.id).indexOf(id);
        const contacts = this.contacts.value;
        contacts[index] = data.updateCompanyContact;
        this.contacts.next(contacts);
        return data.updateCompanyContact;
      }),
    );
  }

  deleteCompanyContact(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCompanyContactGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        const contacts = this.contacts.value.filter((a) => a.id !== id);
        this.contacts.next(contacts);
        return data.deleteCompanyContact;
      }),
    );
  }
}
