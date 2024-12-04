import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { ChallengeType } from '@sifca-monorepo/terminal-generator';
import { ChallengesService } from '../challenges.service';

@Injectable({
  providedIn: 'root',
})
export class ChallengesResolver implements Resolve<any> {
  constructor(private challengesService: ChallengesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChallengeType[]> {
    return this.challengesService.getChallengesByTargetWithDonationProgressPaginated();
  }
}
