import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, of, switchMap } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';

import { PlayerService } from './player/player.service';
import { ProfileService } from './player/components/profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class ModulesResolver implements Resolve<any> {
  selectedPartnerId: string;
  constructor(private playerService: PlayerService, private storageHelper: StorageHelper, private profileService: ProfileService) {}

  resolve(): Observable<any> {
    const accessToken = this.storageHelper.getData('elvkwdigttoken');
    if (accessToken) {
      return combineLatest([
        this.playerService.getPos(),
        this.profileService.currentUserComplete(),
        this.playerService.findLoyaltySettingsByTarget(),
        this.playerService.getWidgetIntegrationByTarget(),
        this.playerService.getLastWidgetOutboundsByTarget(),
      ]).pipe(
        switchMap(([pos]) => {
          if (pos?.aggregator) {
            return this.playerService.getPartnershipNetworksByTargetAndPartnershipPagination();
          }
          return of(null);
        }),
        switchMap((res) => {
          if (res) {
            this.playerService.selectedPartner$ = res[0];
            this.selectedPartnerId = res[0]?.partner?.pos?.id;
            return this.playerService.getCurrentUserLinkedCorporateAccountByTarget(this.selectedPartnerId);
          }
          return of(null);
        }),
        switchMap((res) => {
          if (res?.token) {
            this.playerService.userToken$ = res.token;
            return combineLatest([
              this.playerService.getUserWalletWithReputations(res.token),
              this.playerService.getCurrentUserQuantitativeWallets(res.token),
            ])
          }
          if (!res?.token && this.selectedPartnerId) {
            this.playerService.findLoyaltySettingsByTarget(this.selectedPartnerId).subscribe((result) => {
              const posId = (window as any).widgetInit.appId;
              if (result?.aggregator?.target?.pos?.id !== posId) {
                this.playerService.connectButton$ = true;
              }
            });
          }
          return this.playerService.getUserWalletWithReputations();
        }),
      );
    } else {
      return combineLatest([
        this.playerService.getPos(),
        this.playerService.getWidgetIntegrationByTarget(),
        this.playerService.findLoyaltySettingsByTarget(),
        this.playerService.getLastWidgetOutboundsByTarget(),
      ]).pipe(
        switchMap(([pos]) => {
          if (pos?.aggregator) {
            return this.playerService.getPartnershipNetworksByTargetAndPartnershipPagination();
          }
          return of(null);
        }),
        switchMap((res) => {
          if (res) {
            this.playerService.selectedPartner$ = res[0];
          }
          return of(null);
        }),
      );
    }
  }
}
