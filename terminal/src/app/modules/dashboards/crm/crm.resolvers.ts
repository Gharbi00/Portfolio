import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {
  CrmAnalyticsBalanceOverviewType,
  CrmAnalyticsDealTypeType,
  CrmAnalyticsSalesForecastType,
  CrmAnalyticsStatsInfoType,
} from '@sifca-monorepo/terminal-generator';
import { CrmAnalyticsService } from './crm.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class CrmAnalyticsStatsResolver implements Resolve<any> {
//   constructor(private crmAnalyticsService: CrmAnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CrmAnalyticsStatsInfoType | {}> {
//     return this.crmAnalyticsService.getCrmAnalyticsStats();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CrmAnalyticsSalesForecastResolver implements Resolve<any> {
//   constructor(private crmAnalyticsService: CrmAnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CrmAnalyticsSalesForecastType | {}> {
//     return this.crmAnalyticsService.getCrmAnalyticsSalesForecast();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CrmAnalyticsDealTypeResolver implements Resolve<any> {
//   constructor(private crmAnalyticsService: CrmAnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CrmAnalyticsDealTypeType[] | {}> {
//     return this.crmAnalyticsService.getCrmAnalyticsDealType();
//   }
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CrmAnalyticsBalanceOverviewResolver implements Resolve<any> {
//   constructor(private crmAnalyticsService: CrmAnalyticsService) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CrmAnalyticsBalanceOverviewType | {}> {
//     return this.crmAnalyticsService.getCrmAnalyticsBalanceOverview();
//   }
// }
