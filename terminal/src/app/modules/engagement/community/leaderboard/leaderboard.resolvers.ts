import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { LeaderboardBasePaginatedType } from '@sifca-monorepo/terminal-generator';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardCycleEnum } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardResolver implements Resolve<any> {
  constructor(private leaderboardService: LeaderboardService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LeaderboardBasePaginatedType> {
    return this.leaderboardService.getLiveLeaderboardByCyclePaginated(LeaderboardCycleEnum.OVERALL);
  }
}
