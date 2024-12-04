import { map, tap } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserStatus } from '@sifca-monorepo/terminal-generator';
import { CountryType, LanguageType, GetCountriesGQL, GetLanguagesGQL } from '@sifca-monorepo/terminal-generator';
import {
  UserType,
  UpdateUserGQL,
  CurrentUserGQL,
  UserUpdateInput,
  SaveCurrentUserStatusGQL,
  UpdateCurrentUserPasswordForAppGQL,
} from '@sifca-monorepo/terminal-generator';
import { DOCUMENT } from '@angular/common';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private languages: BehaviorSubject<LanguageType[]> = new BehaviorSubject<LanguageType[]>(null);
  private user: BehaviorSubject<UserType> = new BehaviorSubject<UserType>(null);
  private currentUser: BehaviorSubject<UserType> = new BehaviorSubject<UserType>(null);

  set user$(value: any) {
    this.user.next(value);
  }

  get user$(): Observable<UserType> {
    return this.user.asObservable();
  }
  get languages$(): Observable<LanguageType[]> {
    return this.languages.asObservable();
  }

  get currentUser$(): Observable<UserType> {
    return this.currentUser.asObservable();
  }
  set currentUser$(value: any) {
    this.currentUser.next(value);
  }

  constructor(
    private updateUserGQL: UpdateUserGQL,
    private currentUserGQL: CurrentUserGQL,
    private getCountriesGQL: GetCountriesGQL,
    private getLanguagesGQL: GetLanguagesGQL,
    @Inject(DOCUMENT) private document: Document,
    private saveCurrentUserStatusGQL: SaveCurrentUserStatusGQL,
    private updateCurrentUserPasswordForAppGql: UpdateCurrentUserPasswordForAppGQL,
  ) {}

  findCountries(): Observable<CountryType> {
    return this.getCountriesGQL.fetch().pipe(
      map(({ data }: any) => {
        return data.getCountries;
      }),
    );
  }

  findlanguages(): Observable<LanguageType> {
    return this.getLanguagesGQL.fetch().pipe(
      map(({ data }: any) => {
        this.languages.next(data.getlanguages);
        return data.getlanguages;
      }),
    );
  }

  getCurrentUser(fetchPolicy: FetchPolicy = 'cache-first'): Observable<UserType> {
    return this.currentUserGQL.fetch(undefined, { fetchPolicy }).pipe(
      tap((response: any) => {
        const userScheme = response.data.currentUser.mobileTheme;
        switch (userScheme) {
          case 'LIGHT':
            this.document.body.setAttribute('data-layout-mode', 'light');
            this.document.body.setAttribute('data-sidebar', 'light');
            break;
          case 'DARK':
            this.document.body.setAttribute('data-layout-mode', 'dark');
            this.document.body.setAttribute('data-sidebar', 'dark');
            break;
          default:
            this.document.body.setAttribute('data-layout-mode', 'light');
            break;
        }
        this.currentUser.next(response.data.currentUser);
      }),
    );
  }

  saveCurrentUserStatus(status: UserStatus): Observable<UserType> {
    return this.saveCurrentUserStatusGQL.mutate({ status }).pipe(
      map((response) => {
        this.user.next(response.data.saveCurrentUserStatus as any);
        return response.data.saveCurrentUserStatus as any;
      }),
    );
  }

  update(input: UserUpdateInput, id: string): Observable<UserType> {
    return this.updateUserGQL.mutate({ id, input }).pipe(
      map((response: any) => {
        this.user.next(response.data.updateUser);
        return response.data.updateUser;
      }),
    );
  }

  updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.updateCurrentUserPasswordForAppGql.mutate({ oldPassword, newPassword });
  }
}
