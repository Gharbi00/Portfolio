import { map } from 'lodash';
import { Injectable } from '@angular/core';
import { map as rxMap, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

import {
  UserGQL,
  UserType,
  UserInput,
  AccountType,
  CountryType,
  UpdateUserGQL,
  PermissionType,
  GetAccountsGQL,
  UserUpdateInput,
  MailResponseDto,
  SendValidMailGQL,
  CreateAccountGQL,
  UpdateAccountGQL,
  SearchAccountGQL,
  UserAccountInput,
  ProjectPaginateType,
  CreateUserForAppGQL,
  PermissionDefinitionType,
  RegisterAccountForAppGQL,
  FindCountriesPaginationGQL,
  ListenForUserStatusChangedGQL,
  GetProjectsByTargetWithFilterGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private user: ReplaySubject<UserType> = new ReplaySubject<UserType>(null);
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private team: BehaviorSubject<AccountType[]> = new BehaviorSubject<AccountType[]>(null);
  private isProjectLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private infiniteUsers: BehaviorSubject<UserType[]> = new BehaviorSubject<UserType[]>(null);
  private infiniteTeam: BehaviorSubject<AccountType[]> = new BehaviorSubject<AccountType[]>(null);
  private projectsPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private permissions: BehaviorSubject<PermissionType[]> = new BehaviorSubject<PermissionType[]>(null);
  private loadingPermissions: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private projects: BehaviorSubject<ProjectPaginateType> = new BehaviorSubject<ProjectPaginateType>(null);
  private permissionsDef: BehaviorSubject<PermissionDefinitionType[]> = new BehaviorSubject<PermissionDefinitionType[]>(null);

  page = 0;
  limit = 50;
  searchString = '';
  notification: any;

  get user$(): Observable<UserType> {
    return this.user.asObservable();
  }
  set user$(value: any) {
    this.user.next(value);
  }

  get team$(): Observable<AccountType[]> {
    return this.team.asObservable();
  }
  set team$(value: any) {
    this.team.next(value);
  }

  get infiniteTeam$(): Observable<AccountType[]> {
    return this.infiniteTeam.asObservable();
  }

  get loadingPermissions$(): Observable<boolean> {
    return this.loadingPermissions.asObservable();
  }

  set infiniteTeam$(value: any) {
    this.infiniteTeam.next(value);
  }

  get infiniteUsers$(): Observable<UserType[]> {
    return this.infiniteUsers.asObservable();
  }

  set infiniteUsers$(value: any) {
    this.infiniteUsers.next(value);
  }

  get projectsPagination$(): Observable<IPagination> {
    return this.projectsPagination.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  get isProjectLastPage$(): Observable<boolean> {
    return this.isProjectLastPage.asObservable();
  }

  get projects$(): Observable<ProjectPaginateType> {
    return this.projects.asObservable();
  }

  get permissionsDef$(): Observable<PermissionDefinitionType[]> {
    return this.permissionsDef.asObservable();
  }

  get permissions$(): Observable<PermissionType[]> {
    return this.permissions.asObservable();
  }

  constructor(
    private userGQL: UserGQL,
    private storageHelper: StorageHelper,
    private updateUserGQL: UpdateUserGQL,
    private getAccountsGQL: GetAccountsGQL,
    private searchAccountGQL: SearchAccountGQL,
    private sendValidMailGQL: SendValidMailGQL,
    private createAccountGQL: CreateAccountGQL,
    private updateAccountGQL: UpdateAccountGQL,
    private createUserForAppGQL: CreateUserForAppGQL,
    private registerAccountForAppGQL: RegisterAccountForAppGQL,
    private findCountriesPaginationGQL: FindCountriesPaginationGQL,
    private listenForUserStatusChangedGQL: ListenForUserStatusChangedGQL,
    private getProjectsByTargetWithFilterGQL: GetProjectsByTargetWithFilterGQL,
  ) {}

  getTeam(): Observable<AccountType[]> {
    this.isLoading.next(true);
    return this.getAccountsGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { limit: this.limit, page: this.page } })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.page,
              size: this.limit,
              length: data.getAccounts?.count,
            });
            this.infiniteTeam.next([...(this.infiniteTeam.value || []), ...data.getAccounts.objects]);
            this.infiniteUsers.next([...(this.infiniteUsers.value || []), ...map(data.getAccounts.objects, 'user')]);
            this.team.next(data.getAccounts.objects);
            this.isLast.next(data.getAccounts.isLast);
            this.isLoading.next(false);
            return data.getAccounts.objects;
          }
        }),
      );
  }

  searchAccount(loading = false): Observable<AccountType[]> {
    if (loading === false) {
      this.isLoading.next(true);
    }
    return this.searchAccountGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { limit: 10, page: this.page },
        searchString: this.searchString,
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.page,
              size: 10,
              length: data.searchAccount?.count,
            });
            this.infiniteUsers.next([...(this.infiniteUsers.value || []), ...map(data.searchAccount.objects, 'user')]);
            this.infiniteTeam.next(data.searchAccount.objects);
            this.team.next(data.searchAccount.objects);
            this.isLast.next(data.searchAccount.isLast);
            this.isLoading.next(false);
            return data.searchAccount.objects;
          }
        }),
      );
  }

  getCountries(): Observable<CountryType[]> {
    return this.findCountriesPaginationGQL.fetch({ pagination: { page: 0, limit: 20000 } }).pipe(
      rxMap(({ data }: any) => {
        return data.findCountriesPagination.objects;
      }),
    );
  }

  getUserById(id: string): Observable<UserType> {
    return this.userGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        this.user.next(data.user);
        return data.user;
      }),
    );
  }

  updateUser(id: string, input: UserUpdateInput): Observable<UserType> {
    return this.updateUserGQL.mutate({ id, input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.user.next(response.data.updateUser);
          const accounts = this.team.value;
          if (accounts?.length) {
            const index = accounts?.findIndex((a) => a.user.id === id);
            accounts[index].user = response.data.updateUser;
            this.team.next(accounts);
          }
          return response.data.updateUser;
        }
      }),
    );
  }

  getUserProjects(id: string): Observable<ProjectPaginateType> {
    return this.getProjectsByTargetWithFilterGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        filter: { members: [id] },
        pagination: { limit: this.limit, page: this.page },
      })
      .pipe(
        tap(({ data }: any) => {
          this.projectsPagination.next({
            page: this.page,
            size: this.limit,
            length: data.getProjectsByTargetWithFilter?.count,
          });
          this.projects.next(data.getProjectsByTargetWithFilter);
          this.isProjectLastPage.next(data.getProjectsByTargetWithFilter.isLast);
          return data.getProjectsByTargetWithFilter;
        }),
      );
  }

  sendValidMail(): Observable<MailResponseDto> {
    return this.sendValidMailGQL.mutate({ subject: 'Please validate your email in Sifca' }).pipe(
      tap((response: any) => {
        return response.data.sendValidMail;
      }),
    );
  }

  registerAccountForApp(input: UserAccountInput): Observable<AccountType> {
    return this.registerAccountForAppGQL
      .mutate({
        input: {...input, target: {pos: this.storageHelper.getData('posId')}},
        subject: 'Welcome to Sifca',
        brand: {
          name: 'Sifca',
          logo: 'https://sifca-storage.s3.eu-central-1.amazonaws.com/sifca-brand/12412421432.png',
          website: 'https://sifca.app',
        },
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            const accounts = [data.registerAccountForApp, ...this.team.value];
            this.team.next(accounts);
            return accounts as any;
          }
        }),
      );
  }

  createAccount(input: UserInput): Observable<AccountType[]> {
    const d = new Date();
    return this.createUserForAppGQL
      .mutate({
        input,
        subject: 'Welcome to Sifca',
        variables: {
          company: { name: 'company' },
          brand: {
            name: 'Sifca',
            logo: 'https://sifca-storage.s3.eu-central-1.amazonaws.com/sifca-brand/12412421432.png',
            website: 'https://sifca.app',
          },
        },
      })
      .pipe(
        switchMap(({ data }: any) => {
          return this.createAccountGQL.mutate({
            input: {
              expiresAt: new Date(d.setFullYear(d.getFullYear() + 5)),
              user: data.createUserForApp.id,
              targets: { pos: [this.storageHelper.getData('posId')] },
            },
          });
        }),
        rxMap(({ data }: any) => {
          if (data) {
            const accounts = [data.createAccount, ...this.team.value];
            this.team.next(accounts);
            return accounts;
          }
        }),
      );
  }

  updateAccount(expiresAt: any, accountId: string): Observable<AccountType[]> {
    return this.updateAccountGQL.mutate({ expiresAt, accountId }).pipe(
      tap((response: any) => {
        if (response.data) {
          const accounts = this.team.value;
          const index = accounts.findIndex((a) => a.id === accountId);
          accounts[index] = response.data.updateAccount;
          this.team.next(accounts);
          return accounts;
        }
      }),
    );
  }

  listenForUserStatusChanged(): Observable<UserType> {
    return this.listenForUserStatusChangedGQL.subscribe().pipe(
      rxMap((response: any) => {
        const user = response.data.listenForUserStatusChanged;
        const accounts = this.team.value;
        const index = accounts.findIndex((a) => a.user.id === user.id);
        if (index > -1) {
          accounts[index].user = user;
          this.team.next(accounts);
        }
        return user;
      }),
    );
  }
}
