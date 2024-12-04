import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  AnalyticsAudienceMetricsType,
  AnalyticsAudienceSessionsByCountryType,
  AnalyticsDashboardInput,
  AnalyticsSessionsByCountriesType,
  AnalyticsStatsType,
  AnalyticsTopOperatingSystemsType,
  AnalyticsTopPagesType,
  // AnalyticsTopReferralPagesType,
  AnalyticsUsersByCountryType,
  AnalyticsUsersByDeviceType,
  GetAnalyticsAudienceMetricsGQL,
  GetAnalyticsAudienceSessionsByCountryGQL,
  GetAnalyticsSessionsByCountriesGQL,
  GetAnalyticsStatsGQL,
  GetAnalyticsTopOperatingSystemsGQL,
  GetAnalyticsTopPagesGQL,
  // GetAnalyticsTopReferralPagesGQL,
  GetAnalyticsUserByCountryGQL,
  GetAnalyticsUsersByDeviceGQL,
} from '@sifca-monorepo/terminal-generator';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  pipe(arg0: any) {
    throw new Error('Method not implemented.');
  }
  private loadingStats: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingUserByCountry: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingSessionsByCountries: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingAnalyticsMetrics: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingAnalyticsAudience: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingUsersDevice: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingOperatingSystems: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingTopPages: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private stats: BehaviorSubject<AnalyticsStatsType> = new BehaviorSubject(null);
  private userByCountries: BehaviorSubject<AnalyticsUsersByCountryType> = new BehaviorSubject(null);
  private sessionsByCountries: BehaviorSubject<AnalyticsSessionsByCountriesType[]> = new BehaviorSubject(null);
  private audienceMetrics: BehaviorSubject<AnalyticsAudienceMetricsType> = new BehaviorSubject(null);
  private sessionByCountry: BehaviorSubject<AnalyticsAudienceSessionsByCountryType[]> = new BehaviorSubject(null);
  private usersByDevice: BehaviorSubject<AnalyticsUsersByDeviceType> = new BehaviorSubject(null);
  private topOperatingSystem: BehaviorSubject<AnalyticsTopOperatingSystemsType> = new BehaviorSubject(null);
  private topPages: BehaviorSubject<AnalyticsTopPagesType[]> = new BehaviorSubject(null);

  get stats$(): Observable<AnalyticsStatsType> {
    return this.stats.asObservable();
  }

  get loadingStats$(): Observable<boolean> {
    return this.loadingStats.asObservable();
  }

  get loadingTopPages$(): Observable<boolean> {
    return this.loadingTopPages.asObservable();
  }

  get loadingUsersDevice$(): Observable<boolean> {
    return this.loadingUsersDevice.asObservable();
  }

  get loadingOperatingSystems$(): Observable<boolean> {
    return this.loadingOperatingSystems.asObservable();
  }

  get loadingAnalyticsMetrics$(): Observable<boolean> {
    return this.loadingAnalyticsMetrics.asObservable();
  }

  get loadingSessionsByCountries$(): Observable<boolean> {
    return this.loadingSessionsByCountries.asObservable();
  }

  get loadingAnalyticsAudience$(): Observable<boolean> {
    return this.loadingAnalyticsAudience.asObservable();
  }

  get loadingUserByCountry$(): Observable<boolean> {
    return this.loadingUserByCountry.asObservable();
  }

  set stats$(newValue: any) {
    this.stats.next(newValue);
  }

  get userByCountries$(): Observable<AnalyticsUsersByCountryType> {
    return this.userByCountries.asObservable();
  }

  set userByCountries$(newValue: any) {
    this.userByCountries.next(newValue);
  }

  get sessionsByCountries$(): Observable<AnalyticsSessionsByCountriesType[]> {
    return this.sessionsByCountries.asObservable();
  }

  set sessionsByCountries$(newValue: any) {
    this.sessionsByCountries.next(newValue);
  }

  get audienceMetrics$(): Observable<AnalyticsAudienceMetricsType> {
    return this.audienceMetrics.asObservable();
  }

  set audienceMetrics$(newValue: any) {
    this.audienceMetrics.next(newValue);
  }

  get sessionByCountry$(): Observable<AnalyticsAudienceSessionsByCountryType[]> {
    return this.sessionByCountry.asObservable();
  }

  set sessionByCountry$(newValue: any) {
    this.sessionByCountry.next(newValue);
  }

  get usersByDevice$(): Observable<AnalyticsUsersByDeviceType> {
    return this.usersByDevice.asObservable();
  }

  set usersByDevice$(newValue: any) {
    this.usersByDevice.next(newValue);
  }

  get topOperatingSystem$(): Observable<AnalyticsTopOperatingSystemsType> {
    return this.topOperatingSystem.asObservable();
  }

  set topOperatingSystem$(newValue: any) {
    this.topOperatingSystem.next(newValue);
  }

  get topPages$(): Observable<AnalyticsTopPagesType[]> {
    return this.topPages.asObservable();
  }

  set topPages$(newValue: any) {
    this.topPages.next(newValue);
  }

  constructor(
    private storageHelper: StorageHelper,
    private getAnalyticsStatsGQL: GetAnalyticsStatsGQL,
    private getAnalyticsTopPagesGQL: GetAnalyticsTopPagesGQL,
    private getAnalyticsUserByCountryGQL: GetAnalyticsUserByCountryGQL,
    private getAnalyticsUsersByDeviceGQL: GetAnalyticsUsersByDeviceGQL,
    private getAnalyticsAudienceMetricsGQL: GetAnalyticsAudienceMetricsGQL,
    private getAnalyticsSessionsByCountriesGQL: GetAnalyticsSessionsByCountriesGQL,
    private getAnalyticsTopOperatingSystemsGQL: GetAnalyticsTopOperatingSystemsGQL,
    private getAnalyticsAudienceSessionsByCountryGQL: GetAnalyticsAudienceSessionsByCountryGQL,
  ) {}

  getAnalyticsStats(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<AnalyticsStatsType> {
    this.loadingStats.next(true);
    return this.getAnalyticsStatsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingStats.next(false);
          if (data) {
            this.stats.next(data.getAnalyticsStats);
            return data.getAnalyticsStats;
          }
        }),
      );
  }

  getAnalyticsUserByCountry(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<AnalyticsUsersByCountryType> {
    this.loadingUserByCountry.next(true);
    return this.getAnalyticsUserByCountryGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingUserByCountry.next(false);
          if (data) {
            this.userByCountries.next(data.getAnalyticsUserByCountry);
            return data.getAnalyticsUserByCountry;
          }
        }),
      );
  }

  getAnalyticsSessionsByCountries(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<AnalyticsSessionsByCountriesType[]> {
    this.loadingSessionsByCountries.next(true);
    return this.getAnalyticsSessionsByCountriesGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingSessionsByCountries.next(false);
          if (data) {
            this.sessionsByCountries.next(data.getAnalyticsSessionsByCountries);
            return data.getAnalyticsSessionsByCountries;
          }
        }),
      );
  }

  getAnalyticsAudienceMetrics(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<AnalyticsAudienceMetricsType> {
    this.loadingAnalyticsMetrics.next(true);
    return this.getAnalyticsAudienceMetricsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingAnalyticsMetrics.next(false);
          if (data) {
            this.audienceMetrics.next(data.getAnalyticsAudienceMetrics);
            return data.getAnalyticsAudienceMetrics;
          }
        }),
      );
  }

  getAnalyticsAudienceSessionsByCountry(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<AnalyticsAudienceSessionsByCountryType[]> {
    this.loadingAnalyticsAudience.next(true);
    return this.getAnalyticsAudienceSessionsByCountryGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingAnalyticsAudience.next(false);
          if (data) {
            this.sessionByCountry.next(data.getAnalyticsAudienceSessionsByCountry);
            return data.getAnalyticsAudienceSessionsByCountry;
          }
        }),
      );
  }

  getAnalyticsUsersByDevice(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<AnalyticsUsersByDeviceType> {
    this.loadingUsersDevice.next(true);
    return this.getAnalyticsUsersByDeviceGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingUsersDevice.next(false);
            this.usersByDevice.next(data.getAnalyticsUsersByDevice);
            return data.getAnalyticsUsersByDevice;
          }
        }),
      );
  }

  getAnalyticsTopOperatingSystems(
    input: AnalyticsDashboardInput,
    fetchPolicy: FetchPolicy = 'cache-first',
  ): Observable<AnalyticsTopOperatingSystemsType> {
    this.loadingOperatingSystems.next(true);
    return this.getAnalyticsTopOperatingSystemsGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingOperatingSystems.next(false);
          if (data) {
            this.topOperatingSystem.next(data.getAnalyticsTopOperatingSystems);
            return data.getAnalyticsTopOperatingSystems;
          }
        }),
      );
  }

  getAnalyticsTopPages(input: AnalyticsDashboardInput, fetchPolicy: FetchPolicy = 'cache-first'): Observable<AnalyticsTopPagesType[]> {
    this.loadingTopPages.next(true);
    return this.getAnalyticsTopPagesGQL
      .fetch(
        {
          input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
        },
        { fetchPolicy },
      )
      .pipe(
        map(({ data }: any) => {
          this.loadingTopPages.next(false);
          if (data) {
            this.topPages.next(data.getAnalyticsTopPages);
            return data.getAnalyticsTopPages;
          }
        }),
      );
  }
}
