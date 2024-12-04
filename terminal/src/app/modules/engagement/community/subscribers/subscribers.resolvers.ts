import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SubscribersWithReputationsPaginateType } from '@sifca-monorepo/terminal-generator';

import { SubscribersService } from './subscribers.service';
import { LoyaltySettingsType } from '@sifca-monorepo/terminal-generator';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriberResolver implements Resolve<any> {
  constructor(private subscribersService: SubscribersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SubscribersWithReputationsPaginateType> {
    return this.subscribersService.searchTargetSubscribers();
  }
}
@Injectable({
  providedIn: 'root',
})
export class SettingsResolver implements Resolve<any> {
  constructor(private loyaltyService: LoyaltyService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LoyaltySettingsType> {
    return this.loyaltyService.findLoyaltySettingsByTarget();
  }
}
