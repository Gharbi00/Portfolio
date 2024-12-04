import { combineLatest, take} from 'rxjs';
import { Injectable } from '@angular/core';

import { PlayerService } from '../../modules/player/player.service';
import { ProfileService } from '../../modules/player/components/profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class ResetApiService {

  constructor(private playerService: PlayerService, private profileService: ProfileService) {}

  resetData() {
    this.playerService.userToken$.pipe(take(1)).subscribe((token) => {
      if (token) {
        combineLatest([
          this.profileService.getProfileCompletnessProgress(null, token),
          this.playerService.getLastReferral(token),
          this.playerService.getCurrentUserReputationsLossDate(token),
          this.playerService.getCurrentUserReputationsTurnoverLossDate(token),
          this.playerService.getUserWalletWithReputations(token),
          this.playerService.getCurrentUserQuantitativeWallets(token),
        ])
        .subscribe();
      }
    })
  }
}
