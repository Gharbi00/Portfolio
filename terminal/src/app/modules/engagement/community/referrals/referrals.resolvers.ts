import { Observable, combineLatest } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ReferralsService } from './referrals.service';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';
import { LoyaltySettingsType, ReferralType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class ReferralsResolver implements Resolve<any> {
  constructor(private referralsService: ReferralsService, private loyaltyService: LoyaltyService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<[LoyaltySettingsType, ReferralType[]]> {
    return combineLatest([this.loyaltyService.findLoyaltySettingsByTarget(), this.referralsService.getReferralsByTargetPagination()])

  }
}
