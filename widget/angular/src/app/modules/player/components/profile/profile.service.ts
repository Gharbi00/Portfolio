import { Injectable } from '@angular/core';
import { map as rxMap, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  UserType,
  CountryType,
  MailResponseDto,
  SendValidMailGQL,
  SocialPaginatedType,
  SocialType,
  FindSocialsPaginationGQL,
  GetProfileCompletnessProgressGQL,
  ProfileCompletnessProgressType,
  UpdateCorporateUserProfileGQL,
} from '@sifca-monorepo/widget-generator';
import { UserUpdateInput, UpdateCurrentUserGQL, CurrentUserCompleteGQL } from '@sifca-monorepo/widget-generator';
import { FetchPolicy } from '@apollo/client/core';
import {
  FindCountriesPaginationGQL,
  FindStatesByCountryPaginationGQL,
  GetLanguagesGQL,
  LanguageType,
  StateType,
} from '@sifca-monorepo/widget-generator';
import { ProjectPaginateType } from '@sifca-monorepo/widget-generator';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private isLastStates: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private currentUser: BehaviorSubject<UserType> = new BehaviorSubject<UserType>(null);
  private isLastCountries: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private workStates: BehaviorSubject<StateType[]> = new BehaviorSubject<StateType[]>(null);
  private targetFormVisible: BehaviorSubject<string> = new BehaviorSubject<string>('profile');
  private socialMedia: BehaviorSubject<SocialType[]> = new BehaviorSubject<SocialType[]>(null);
  private infiniteStates: BehaviorSubject<StateType[]> = new BehaviorSubject<StateType[]>(null);
  private languages: BehaviorSubject<LanguageType[]> = new BehaviorSubject<LanguageType[]>(null);
  private infiniteCountries: BehaviorSubject<CountryType[]> = new BehaviorSubject<CountryType[]>(null);
  private projects: BehaviorSubject<ProjectPaginateType> = new BehaviorSubject<ProjectPaginateType>(null);
  private completeProfile: BehaviorSubject<ProfileCompletnessProgressType> = new BehaviorSubject<ProfileCompletnessProgressType>(null);

  page = 0;
  limit = 50;
  searchString = '';
  notification: any;

  get currentUser$(): Observable<UserType> {
    return this.currentUser.asObservable();
  }
  set currentUser$(value: any) {
    this.currentUser.next(value);
  }

  get socialMedia$(): Observable<SocialType[]> {
    return this.socialMedia.asObservable();
  }

  get targetFormVisible$(): Observable<string> {
    return this.targetFormVisible.asObservable();
  }
  set targetFormVisible$(value: any) {
    this.targetFormVisible.next(value);
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  get projects$(): Observable<ProjectPaginateType> {
    return this.projects.asObservable();
  }

  get infiniteStates$(): Observable<StateType[]> {
    return this.infiniteStates.asObservable();
  }

  get infiniteCountries$(): Observable<CountryType[]> {
    return this.infiniteCountries.asObservable();
  }

  get workStates$(): Observable<StateType[]> {
    return this.workStates.asObservable();
  }

  get languages$(): Observable<LanguageType[]> {
    return this.languages.asObservable();
  }

  get isLastCountries$(): Observable<boolean> {
    return this.isLastCountries.asObservable();
  }

  get isLastStates$(): Observable<boolean> {
    return this.isLastStates.asObservable();
  }

  get completeProfile$(): Observable<ProfileCompletnessProgressType> {
    return this.completeProfile.asObservable();
  }

  constructor(
    private getLanguagesGQL: GetLanguagesGQL,
    private sendValidMailGQL: SendValidMailGQL,
    private updateCurrentUserGQL: UpdateCurrentUserGQL,
    private currentUserCompleteGQL: CurrentUserCompleteGQL,
    private findSocialsPaginationGQL: FindSocialsPaginationGQL,
    private findCountriesPaginationGQL: FindCountriesPaginationGQL,
    private updateCorporateUserProfileGQL: UpdateCorporateUserProfileGQL,
    private findStatesByCountryPaginationGQL: FindStatesByCountryPaginationGQL,
    private getProfileCompletnessProgressGQL: GetProfileCompletnessProgressGQL,
  ) {}

  getProfileCompletnessProgress(id?: string, token?: string): Observable<ProfileCompletnessProgressType> {
    return this.getProfileCompletnessProgressGQL.fetch(id ? { id } : token ? { userToken: token } : {}).pipe(
      rxMap(({ data }: any) => {
        this.completeProfile.next(data.getProfileCompletnessProgress);
        return data.getProfileCompletnessProgress;
      }),
    );
  }

  findCountriesPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<CountryType[]> {
    return this.findCountriesPaginationGQL.fetch({ pagination: { page: 0, limit: 10000 } }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        this.infiniteCountries.next([...(this.infiniteCountries.value || []), ...data.findCountriesPagination?.objects]);
        this.isLastCountries.next(data.findCountriesPagination.isLast);
        return data.findCountriesPagination.objects;
      }),
    );
  }

  findStatesByCountryPagination(country: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<StateType[]> {
    return this.findStatesByCountryPaginationGQL.fetch({ country, pagination: { page: 0, limit: 10000 } }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.isLastStates.next(data.findStatesByCountryPagination?.isLast);
          this.infiniteStates.next(data.findStatesByCountryPagination?.objects);
          return data.findStatesByCountryPagination.objects;
        }
      }),
    );
  }

  findSocialsPagination(): Observable<SocialPaginatedType> {
    return this.findSocialsPaginationGQL.fetch({}).pipe(
      rxMap((response: any) => {
        this.socialMedia.next(response.data.findSocialsPagination.objects);
        return response.data.findSocialsPagination;
      }),
    );
  }

  findWorkStatesByCountryPagination(country: string): Observable<StateType[]> {
    return this.findStatesByCountryPaginationGQL.fetch({ pagination: { limit: 10000, page: 0 }, country }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.workStates.next(data.findStatesByCountryPagination.objects);
          return data.findStatesByCountryPagination.objects;
        }
      }),
    );
  }

  currentUserComplete(): Observable<UserType> {
    return this.currentUserCompleteGQL.fetch({}).pipe(
      rxMap(({ data }: any) => {
        this.currentUser.next(data?.currentUserComplete);
        return data?.currentUserComplete;
      }),
    );
  }

  getLanguages(fetchPolicy: FetchPolicy = 'network-only'): Observable<LanguageType> {
    return this.getLanguagesGQL.fetch({}, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        this.languages.next(data?.getLanguages);
        return data?.getLanguages;
      }),
    );
  }

  updateCurrentUser(input: UserUpdateInput): Observable<UserType> {
    return this.updateCurrentUserGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.currentUser.next(data.updateCurrentUser);
          return data.updateCurrentUser;
        }
      }),
    );
  }

  updateCorporateUserProfile(input: UserUpdateInput): Observable<UserType> {
    return this.currentUser$.pipe(
      take(1),
      switchMap((currentUser) => {
        return this.updateCorporateUserProfileGQL.mutate({ input, id: currentUser?.id })
          .pipe(
            rxMap(({ data }: any) => {
              if (data) {
                return data.updateCorporateUserProfile;
              }
            }),
          );
      }),
    );
  }

  sendValidMail(): Observable<MailResponseDto> {
    return this.sendValidMailGQL.mutate({ subject: 'Please validate your email in Sifca' }).pipe(
      rxMap((response: any) => {
        return response.data.sendValidMail;
      }),
    );
  }
}
