import { findIndex, includes, omit } from 'lodash-es';
import { Injectable } from '@angular/core';
import { catchError, map, switchMap, throttleTime } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, Observable, of, Subscription, throwError, timer } from 'rxjs';

import { AuthUtils, StorageHelper } from '@diktup/frontend/helpers';
import {
  UserRole,
  UserType,
  UserStatus,
  AccountType,
  RequestInput,
  LoginForAppGQL,
  CreateRequestGQL,
  CurrentAccountGQL,
  SendForgotPasswordMailGQL,
  UpdateUserPasswordForAppGQL,
  ResetPasswordWithMailForAppGQL,
} from '@sifca-monorepo/terminal-generator';
import { PosService } from '../services/pos.service';
import { UserService } from '../services/user.service';
import { ApolloCache } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private authenticated = false;

  user: UserType;
  timer: Subscription;
  mouseEvents: Subscription;
  private cache: ApolloCache<any> = this.apollo.client.cache;
  private authenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private account: BehaviorSubject<AccountType> = new BehaviorSubject<AccountType>(null);

  set accessToken(token: string) {
    this.storageHelper.setData({ accessToken: token });
  }

  get accessToken(): string {
    return this.storageHelper.getData('accessToken');
  }

  set setAccount(value: AccountType) {
    this.account.next(value);
  }

  get account$(): Observable<AccountType> {
    return this.account.asObservable();
  }

  get authenticated$(): Observable<boolean> {
    return this.authenticated.asObservable();
  }
  set authenticated$(value: any) {
    this.authenticated.next(value);
  }

  constructor(
    private apollo: Apollo,
    private posService: PosService,
    private userService: UserService,
    private storageHelper: StorageHelper,
    private loginForAppGql: LoginForAppGQL,
    private createRequestGQL: CreateRequestGQL,
    private currentAccountGQL: CurrentAccountGQL,
    private sendForgotPasswordMailGql: SendForgotPasswordMailGQL,
    private updateUserPasswordForAppGQL: UpdateUserPasswordForAppGQL,
    private resetPasswordWithMailForAppGQL: ResetPasswordWithMailForAppGQL,
  ) {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  signIn(credentials: { login: string; password: string }): Observable<any> {
    if (this.accessToken) {
      return throwError(() => new Error('User is already logged in.'));
    }
    return this.loginForAppGql.fetch({ input: { ...omit(credentials, 'rememberMe') } }).pipe(
      switchMap((res) => {
        if (res.data) {
          this.accessToken = res.data.loginForApp.accessToken;
          this.authenticated.next(true);
          this.storageHelper.setData({ accessToken: this.accessToken });
          return this.currentAccountGQL.fetch(undefined).pipe(
            map((response: any) => {
              this.account.next(response.data.currentAccount as any);
              return response as any;
            }),
          );
        }
        if (res.errors) {
          this.authenticated.next(false)
        }
        return of(res);
      }),
      switchMap((result: any) => {
        if (result.data) {
          this.posService.setPos = result.data.currentAccount.targets.pos[0];
          this.userService.user$ = result.data.currentAccount.user;
          this.storageHelper.setData({ posId: result.data.currentAccount.targets.pos[0].id });
          this.storageHelper.setData({ company: result.data.currentAccount.targets.pos[0].company.id });
          this.storageHelper.setData({ currentUserId: result.data.currentAccount.user.id });
          this.storageHelper.setData({ theme: result.data.currentAccount.user.mobileTheme });
          this.updateOnIdle();
          return this.userService.saveCurrentUserStatus(UserStatus.ONLINE).pipe(map(() => result));
        }
        return of(result);
      }),
    );
  }

  updateUserPasswordForApp(id: string, newPassword: string): Observable<UserType> {
    return this.updateUserPasswordForAppGQL.mutate({ id, newPassword }).pipe(
      map(({ data }: any) => {
        return data.updateUserPasswordForApp;
      }),
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.sendForgotPasswordMailGql.mutate({ subject: 'Reset your Sifca password', email });
  }

  resetPassword(password: string, token: string): Observable<any> {
    return this.resetPasswordWithMailForAppGQL.mutate({
      input: {
        password,
        token,
      },
    });
  }

  createRequest(input: RequestInput): Observable<any> {
    return this.createRequestGQL.mutate({
      input: {
        ...input,
        target: { pos: '650b63c094e67c588943cc67' },
      },
    });
  }

  updateOnIdle(): void {
    if (this.user.status !== UserStatus.BUSY) {
      this.mouseEvents = fromEvent(document, 'mousemove')
        .pipe(throttleTime(290000))
        .subscribe(() => {
          this.userService.saveCurrentUserStatus(UserStatus.ONLINE).subscribe();
          this.resetTimer();
        });
    }
  }

  private resetTimer(): void {
    if (this.timer) {
      this.timer.unsubscribe();
    }
    this.timer = timer(300000).subscribe(() => this.userService.saveCurrentUserStatus(UserStatus.AWAY).subscribe());
  }

  signInUsingToken(): Observable<any> {
    return this.currentAccountGQL.fetch().pipe(
      catchError(() => {
        this.authenticated.next(false)
        return of(false);
      }),
      switchMap((result: any) => {
        this.authenticated.next(true)
        const posId = this.storageHelper.getData('posId');
        const index = findIndex(result.data.currentAccount.targets.pos, { id: posId });
        this.userService.user$ = result.data.currentAccount.user;
        this.posService.setPos = result.data.currentAccount.targets.pos[index];
        this.account.next(result.data.currentAccount as any);
        return of(true);
      }),
    );
  }

  signOut(): Observable<any> {
    this.userService.saveCurrentUserStatus(UserStatus.OFFLINE).subscribe(() => {
      if (this.mouseEvents) {
        this.mouseEvents.unsubscribe();
      }
      if (this.timer) {
        this.timer.unsubscribe();
      }
      this.storageHelper.clearLocalStorage();
      this.authenticated.next(false)
      this.cache.reset();
      this.apollo.client.clearStore();
    });
    return of(true);
  }

  unlockSession(credentials: { login: string; password: string }): Observable<any> {
    return this.loginForAppGql.fetch({ input: { ...credentials } });
  }

  check(): Observable<boolean> {
    if (this.authenticated.value === true) {
      return of(true);
    }
    // Check the access token availability
    if (!this.accessToken) {
      return of(false);
    }
    if (AuthUtils.isTokenExpired(this.accessToken)) {
      return of(false);
    }
    // If the access token exists and it didn't expire, sign in using it
    return this.signInUsingToken();
  }

  userHasRole(role: UserRole): boolean {
    return this.user?.roles.length ? includes(this.user.roles, role) : false;
  }
}
