import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import {
  CountryType,
  GetBrandColorsGQL,
  KeyValueListType,
  SocialType,
  UserType,
  PaymentType,
  PointOfSaleType,
  PointOfSaleInput,
  CurrentAccountGQL,
  UpdatePointOfSaleGQL,
  WebsiteIntegrationType,
  GetWebsiteIntegrationByTargetGQL,
  PointOfSaleGQL,
  BankType,
  StateType,
  GetBanksGQL,
  CurrencyType,
  LanguageType,
  BankDetailsType,
  BankDetailsInput,
  StatePaginatedType,
  FindSocialByCodeGQL,
  PaymentPaginatedType,
  CreateBankDetailsGQL,
  UpdateBankDetailsGQL,
  FindStatesPaginationGQL,
  FindSocialsPaginationGQL,
  FindPaymentsPaginationGQL,
  FindCountriesPaginationGQL,
  FindlanguagesPaginationGQL,
  FindCurrenciesPaginationGQL,
  FindStatesByCountryPaginationGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class PosService {
  private banks: BehaviorSubject<BankType[]> = new BehaviorSubject<BankType[]>([]);
  private allStates: BehaviorSubject<StateType[]> = new BehaviorSubject<StateType[]>([]);
  private isLastStates: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentUser: BehaviorSubject<UserType> = new BehaviorSubject<UserType>(null);
  private isLastLanguages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isLastCountries: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isLastCurrencies: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private socials: BehaviorSubject<SocialType[]> = new BehaviorSubject<SocialType[]>(null);
  private pos: BehaviorSubject<PointOfSaleType> = new BehaviorSubject<PointOfSaleType>(null);
  private allCountries: BehaviorSubject<CountryType[]> = new BehaviorSubject<CountryType[]>([]);
  private currencies: BehaviorSubject<CurrencyType[]> = new BehaviorSubject<CurrencyType[]>([]);
  private infiniteStates: BehaviorSubject<StateType[]> = new BehaviorSubject<StateType[]>(null);
  private paymentMethods: BehaviorSubject<PaymentType[]> = new BehaviorSubject<PaymentType[]>(null);
  private infiniteCountries: BehaviorSubject<CountryType[]> = new BehaviorSubject<CountryType[]>(null);
  private infiniteLanguages: BehaviorSubject<LanguageType[]> = new BehaviorSubject<LanguageType[]>(null);
  private infiniteCurrencies: BehaviorSubject<CurrencyType[]> = new BehaviorSubject<CurrencyType[]>(null);
  private brandColors: BehaviorSubject<KeyValueListType[]> = new BehaviorSubject<KeyValueListType[]>(null);
  private website: BehaviorSubject<WebsiteIntegrationType> = new BehaviorSubject<WebsiteIntegrationType>(null);

  statesPageIndex = 0;
  languagesPageIndex = 0;
  countriesPageIndex = 0;
  currenciesPageIndex = 0;
  currenciesPageLimit = 10;

  set setPos(value: PointOfSaleType) {
    this.pos.next(value);
  }
  get pos$(): Observable<PointOfSaleType> {
    return this.pos.asObservable();
  }
  get brandColors$(): Observable<KeyValueListType[]> {
    return this.brandColors.asObservable();
  }
  get paymentMethods$(): Observable<PaymentType[]> {
    return this.paymentMethods.asObservable();
  }
  get banks$(): Observable<BankType[]> {
    return this.banks.asObservable();
  }
  get socials$(): Observable<SocialType[]> {
    return this.socials.asObservable();
  }
  get price$(): Observable<BankType[]> {
    return this.banks.asObservable();
  }
  get currentUser$(): Observable<UserType> {
    return this.currentUser.asObservable();
  }

  get currencies$(): Observable<CurrencyType[]> {
    return this.currencies.asObservable();
  }

  get infiniteStates$(): Observable<StateType[]> {
    return this.infiniteStates.asObservable();
  }
  set infiniteStates$(value: any) {
    this.infiniteStates.next(value);
  }

  get infiniteCurrencies$(): Observable<CurrencyType[]> {
    return this.infiniteCurrencies.asObservable();
  }
  set infiniteCurrencies$(value: any) {
    this.infiniteCurrencies.next(value);
  }

  get infiniteCountries$(): Observable<CountryType[]> {
    return this.infiniteCountries.asObservable();
  }
  set infiniteCountries$(value: any) {
    this.infiniteCountries.next(value);
  }

  get infiniteLanguages$(): Observable<LanguageType[]> {
    return this.infiniteLanguages.asObservable();
  }
  set infiniteLanguages$(value: any) {
    this.infiniteLanguages.next(value);
  }

  get isLastCurrencies$(): Observable<boolean> {
    return this.isLastCurrencies.asObservable();
  }

  get isLastLanguages$(): Observable<boolean> {
    return this.isLastLanguages.asObservable();
  }

  get isLastCountries$(): Observable<boolean> {
    return this.isLastCountries.asObservable();
  }

  get isLastStates$(): Observable<boolean> {
    return this.isLastStates.asObservable();
  }

  get website$(): Observable<WebsiteIntegrationType> {
    return this.website.asObservable();
  }

  get allStates$(): Observable<StateType[]> {
    return this.allStates.asObservable();
  }

  get allCountries$(): Observable<CountryType[]> {
    return this.allCountries.asObservable();
  }

  constructor(
    private getBanksGQL: GetBanksGQL,
    private storageHelper: StorageHelper,
    private pointOfSaleGQL: PointOfSaleGQL,
    private currentAccountGQL: CurrentAccountGQL,
    private getBrandColorsGQL: GetBrandColorsGQL,
    private findSocialByCodeGQL: FindSocialByCodeGQL,
    private createBankDetailsGQL: CreateBankDetailsGQL,
    private updatePointOfSaleGQL: UpdatePointOfSaleGQL,
    private updateBankDetailsGQL: UpdateBankDetailsGQL,
    private findStatesPaginationGQL: FindStatesPaginationGQL,
    private findSocialsPaginationGQL: FindSocialsPaginationGQL,
    private findPaymentsPaginationGQL: FindPaymentsPaginationGQL,
    private findCountriesPaginationGQL: FindCountriesPaginationGQL,
    private findlanguagesPaginationGQL: FindlanguagesPaginationGQL,
    private findCurrenciesPaginationGQL: FindCurrenciesPaginationGQL,
    private findStatesByCountryPaginationGQL: FindStatesByCountryPaginationGQL,
    private getWebsiteIntegrationByTargetGQL: GetWebsiteIntegrationByTargetGQL,
  ) {}

  getPointOfSale(): Observable<PointOfSaleType> {
    return this.pointOfSaleGQL.fetch({ id: this.storageHelper.getData('posId') }).pipe(
      map((response: any) => {
        this.pos.next(response.data.pointOfSale);
        return response.data.pointOfSale;
      }),
    );
  }

  findSocialsPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<SocialType[]> {
    return this.findSocialsPaginationGQL.fetch(undefined, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        this.socials.next(data.findSocialsPagination.objects);
        return data.findSocialsPagination.objects;
      }),
    );
  }

  findSocialByCode(code: string): Observable<SocialType> {
    return this.findSocialByCodeGQL.fetch({ code }).pipe(
      map(({ data }: any) => {
        return data.findSocialByCode;
      }),
    );
  }

  findCountriesPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<CountryType[]> {
    return this.findCountriesPaginationGQL.fetch({ pagination: { page: 0, limit: 10000 } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        this.infiniteCountries.next([...(this.infiniteCountries.value || []), ...data.findCountriesPagination?.objects]);
        this.allCountries.next(data.findCountriesPagination?.objects);
        this.isLastCountries.next(data.findCountriesPagination.isLast);
        return data.findCountriesPagination.objects;
      }),
    );
  }

  findCurrenciesPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<CurrencyType[]> {
    return this.findCurrenciesPaginationGQL.fetch({ pagination: { page: this.currenciesPageIndex, limit: 10000 } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        this.infiniteCurrencies.next([...(this.infiniteCurrencies.value || []), ...data.findCurrenciesPagination?.objects]);
        this.isLastCurrencies.next(data.findCurrenciesPagination?.isLast);
        return data.findCurrenciesPagination?.objects;
      }),
    );
  }

  findlanguagesPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<CurrencyType[]> {
    return this.findlanguagesPaginationGQL.fetch({ pagination: { page: this.languagesPageIndex, limit: 1000 } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        this.infiniteLanguages.next([...(this.infiniteLanguages.value || []), ...data.findlanguagesPagination?.objects]);
        this.isLastLanguages.next(data.findlanguagesPagination?.isLast);
        return data.findlanguagesPagination?.objects;
      }),
    );
  }

  getWebsiteIntegrationByTarget(): Observable<WebsiteIntegrationType> {
    return this.getWebsiteIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.website.next(data.getWebsiteIntegrationByTarget);
          return data.getWebsiteIntegrationByTarget;
        }
      }),
    );
  }

  findStatesPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<StatePaginatedType> {
    return this.findStatesPaginationGQL.fetch({ pagination: { page: this.statesPageIndex, limit: 10 } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.findStatesPagination.objects;
        }
      }),
    );
  }

  findStatesByCountryPagination(country: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<StateType[]> {
    return this.findStatesByCountryPaginationGQL.fetch({ country, pagination: { page: 0, limit: 10000 } }, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.isLastStates.next(data.findStatesByCountryPagination?.isLast);
          this.allStates.next(data.findStatesByCountryPagination?.objects);
          this.infiniteStates.next([...(this.infiniteStates.value || []), ...data.findStatesByCountryPagination?.objects]);
          return data.findStatesByCountryPagination.objects;
        }
      }),
    );
  }

  getCurrentPOS(fetchPolicy: FetchPolicy = 'cache-first'): Observable<PointOfSaleType> {
    return this.currentAccountGQL.fetch(undefined, { fetchPolicy }).pipe(
      map((response: any) => {
        this.banks.next(response.data.currentAccount.targets.pos[0].company.banks);
        this.pos.next(response.data.currentAccount.targets.pos[0]);
        this.currentUser.next(response.data.currentAccount.user);
        return response.data.currentAccount;
      }),
    );
  }

  getBanks(fetchPolicy: FetchPolicy = 'cache-first'): Observable<BankType> {
    return this.getBanksGQL.fetch(undefined, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        return data.getBanks;
      }),
    );
  }

  createBankDetails(input: BankDetailsInput): Observable<BankDetailsType> {
    return this.createBankDetailsGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.banks.next([data.createBankDetails, ...this.banks.value]);
          this.pos.next({
            ...this.pos.value,
            company: {
              ...this.pos.value.company,
              banks: [data.createBankDetails, ...this.pos.value.company.banks],
            },
          });
          return data.createBankDetails;
        }
      }),
    );
  }

  updateBankDetails(id: string, input: BankDetailsInput): Observable<BankDetailsType> {
    return this.updateBankDetailsGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.banks.next([data.updateBankDetails, ...this.banks.value]);
          const index = this.pos.value.company.banks.findIndex((item) => item.id === id);
          this.pos.value.company.banks[index] = data.updateBankDetails;
          this.pos.next({
            ...this.pos.value,
            company: {
              ...this.pos.value.company,
              banks: this.pos.value.company.banks,
            },
          });
          return data.updateBankDetails;
        }
      }),
    );
  }

  findPaymentsPagination(fetchPolicy: FetchPolicy = 'cache-first'): Observable<PaymentPaginatedType> {
    return this.findPaymentsPaginationGQL.fetch(undefined, { fetchPolicy }).pipe(
      map(({ data }: any) => {
        this.paymentMethods.next(data.findPaymentsPagination.objects);
        return data.findPaymentsPagination.objects;
      }),
    );
  }

  update(input: PointOfSaleInput): Observable<PointOfSaleType> {
    return this.updatePointOfSaleGQL.mutate({ input, id: this.pos.value.id }).pipe(
      map(({ data }: any) => {
        this.pos.next(data.updatePointOfSale);
        return data.updatePointOfSale;
      }),
    );
  }

  getBrandColors(fetchPolicy: FetchPolicy = 'cache-first'): Observable<KeyValueListType[]> {
    return this.getBrandColorsGQL.fetch(undefined, { fetchPolicy }).pipe(
      tap((response: any) => {
        this.brandColors.next(response.data.getBrandColors);
      }),
    );
  }
}
