import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsTopPagesType,
  AnalyticsUsersByDeviceType,
  AnalyticsAudienceMetricsType,
  AnalyticsTopOperatingSystemsType,
} from '@sifca-monorepo/terminal-generator';

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsStatsResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsStatsType | {}> {
//     const filter = {
//       from: new Date(new Date().setHours(0, 0, 0, 0)),
//       to: new Date(new Date().setHours(23, 59, 59, 999)),
//     };
//     return this.analyticsService.getAnalyticsStats({ from: filter?.from, to: filter?.to });
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsUsersCountriesResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsUsersByCountryType | {}> {
//     return this.analyticsService.getAnalyticsUserByCountry();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsSessionsByCountriesResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsSessionsByCountriesType[] | {}> {
//     return this.analyticsService.getAnalyticsSessionsByCountries();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsAudienceMetricsResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsAudienceMetricsType | {}> {
//     return this.analyticsService.getAnalyticsAudienceMetrics();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsSessionByCountryResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsAudienceSessionsByCountryType[] | {}> {
//     return this.analyticsService.getAnalyticsAudienceSessionsByCountry();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsUsersByDeviceResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsUsersByDeviceType | {}> {
//     return this.analyticsService.getAnalyticsUsersByDevice();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsTopOperatingSystemsResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsTopOperatingSystemsType> {
//     return this.analyticsService.getAnalyticsTopOperatingSystems();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AnalyticsTopPagesResolver implements Resolve<any> {
//   constructor(private analyticsService: AnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AnalyticsTopPagesType[] | {}> {
//     return this.analyticsService.getAnalyticsTopPages();
//   }
// }
