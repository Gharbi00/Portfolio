import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { MailResponseDto, UpdateUserGQL, UserExistType, UserGQL, UserUpdateInput } from '@sifca-monorepo/terminal-generator';
import {
  UserType,
  UserStatus,
  CorporateUserType,
  AddUserForTargetGQL,
  IsLoginForTargetExistGQL,
  GetTargetUsersByExcelGQL,
  SendTargetUsersBymailGQL,
  ImportTargetUsersByExcelGQL,
  SearchCorporateUsersByTargetGQL,
} from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType, SuccessResponseDtoType } from '@sifca-monorepo/terminal-generator';

import { PosService } from '../../../../core/services/pos.service';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private contact: BehaviorSubject<CorporateUserType> = new BehaviorSubject(null);
  private contacts: BehaviorSubject<CorporateUserType[]> = new BehaviorSubject(null);
  private infiniteContacts: BehaviorSubject<CorporateUserType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  filterLimit = 20;
  searchString: BehaviorSubject<''> = new BehaviorSubject(null);
  status: BehaviorSubject<UserStatus[] | null> = new BehaviorSubject(null);

  get searchString$(): Observable<string> {
    return this.searchString.asObservable();
  }
  set searchString$(newValue: any) {
    this.searchString.next(newValue);
  }

  get status$(): Observable<UserStatus[]> {
    return this.status.asObservable();
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  get contact$(): Observable<CorporateUserType> {
    return this.contact.asObservable();
  }

  set contact$(newValue: any) {
    this.contact.next(newValue);
  }

  get contacts$(): Observable<CorporateUserType[]> {
    return this.contacts.asObservable();
  }

  set contacts$(value: any) {
    this.contacts.next(value);
  }

  get infiniteContacts$(): Observable<CorporateUserType[]> {
    return this.infiniteContacts.asObservable();
  }

  set infiniteContacts$(value: any) {
    this.infiniteContacts.next(value);
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  constructor(
    private userGQL: UserGQL,
    private posService: PosService,
    private updateUserGQL: UpdateUserGQL,
    private storageHelper: StorageHelper,
    private addUserForTargetGQL: AddUserForTargetGQL,
    private isLoginForTargetExistGQL: IsLoginForTargetExistGQL,
    private getTargetUsersByExcelGQL: GetTargetUsersByExcelGQL,
    private sendTargetUsersBymailGQL: SendTargetUsersBymailGQL,
    private importTargetUsersByExcelGQL: ImportTargetUsersByExcelGQL,
    private searchCorporateUsersByTargetGQL: SearchCorporateUsersByTargetGQL,
  ) {}

  sendTargetUsersBymail(emails: string): Observable<MailResponseDto> {
    return this.sendTargetUsersBymailGQL
      .fetch({
        ...(this.status.value ? { status: this.status.value } : {}),
        ...(this.searchString.value ? { searchString: this.searchString.value } : {}),
        emails,
        subject: 'Your export of customers',
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          return data.sendTargetUsersBymail;
        }),
      );
  }

  importTargetUsersByExcel(base64: string): Observable<SuccessResponseDtoType> {
    return this.importTargetUsersByExcelGQL
      .mutate({
        base64,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          return data.importTargetUsersByExcel;
        }),
      );
  }

  getTargetUsersByExcel(): Observable<InvoicePdfType> {
    return this.getTargetUsersByExcelGQL
      .fetch({
        ...(this.searchString.value ? { searchString: this.searchString.value } : {}),
        target: { pos: this.storageHelper.getData('posId') },
        ...(this.status.value ? { status: this.status.value } : {}),
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getTargetUsersByExcel.content;
          }
        }),
      );
  }

  searchCorporateUsersByTarget(): Observable<CorporateUserType[]> {
    this.isLoading.next(true);
    return this.posService.pos$.pipe(
      take(1),
      switchMap((pos) =>
        this.searchCorporateUsersByTargetGQL
          .fetch({
            ...(this.searchString.value ? { searchString: this.searchString.value } : {}),
            ...(this.status.value ? { status: this.status.value } : {}),
            pagination: { page: this.pageIndex, limit: this.filterLimit },
            target: { pos: pos.id },
          })
          .pipe(
            map(({ data }: any) => {
              if (data) {
                this.infiniteContacts.next([...(this.infiniteContacts.value || []), ...data.searchCorporateUsersByTarget.objects]);
                this.isLast.next(data.searchCorporateUsersByTarget.isLast);
                this.contacts.next(data.searchCorporateUsersByTarget.objects);
                this.isLoading.next(false);
                this.pagination.next({
                  length: data.searchCorporateUsersByTarget.count,
                  size: this.filterLimit,
                  page: this.pageIndex,
                });
                return data.searchCorporateUsersByTarget.objects;
              }
            }),
          ),
      ),
    );
  }

  getUserById(id: string): Observable<CorporateUserType> {
    return this.userGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.contact.next(data.user);
          return data.user;
        }
      }),
    );
  }

  getContactById(id: string): Observable<CorporateUserType> {
    return this.contacts.pipe(
      take(1),
      map((contacts) => {
        const contact = contacts.find((item) => item.id === id) || null;
        this.contact.next(contact);
        return contact;
      }),
      switchMap((contact) => {
        if (!contact) {
          return throwError(() => new Error('Could not found contact with id of ' + id + '!'));
        }
        return of(contact);
      }),
    );
  }

  addUserForTarget(user: any): Observable<UserType> {
    return this.posService.pos$.pipe(
      switchMap((pos) =>
        this.addUserForTargetGQL.mutate({ input: { ...user, target: { pos: pos.id } } }).pipe(
          map((response: any) => {
            this.contacts.next([response.data.addUserForTarget, ...this.contacts.value]);
            this.contact.next(response.data.addUserForTarget);
            return response.data.addUserForTarget;
          }),
        ),
      ),
    );
  }

  isLoginForTargetExist(login: string): Observable<UserExistType> {
    return this.posService.pos$.pipe(
      switchMap((pos) =>
        this.isLoginForTargetExistGQL.fetch({ input: { login, target: { pos: pos.id } } }).pipe(
          map((response: any) => {
            return response.data.isLoginForTargetExist;
          }),
        ),
      ),
    );
  }

  updateUser(id: string, input: UserUpdateInput): Observable<UserType> {
    return this.contacts$.pipe(
      take(1),
      switchMap((contacts) =>
        this.updateUserGQL.mutate({ id, input }).pipe(
          map(({ data }: any) => {
            if (data) {
              const index = contacts?.findIndex((item) => item.id === id);
              if (index > -1) {
                contacts[index] = data.updateUser;
                this.contacts.next(contacts);
              }
              this.contact.next(data.updateUser);
              return data.updateUser;
            }
            return null;
          }),
        ),
      ),
    );
  }
}
