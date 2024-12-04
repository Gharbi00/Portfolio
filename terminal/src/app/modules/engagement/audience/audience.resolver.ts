import { Observable, catchError, combineLatest, of } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

import { AudienceType, DefaultAudienceType } from '@sifca-monorepo/terminal-generator';

import { AudiencesService } from './audience.service';
import { QuestTypeService } from '../../system/apps/apps/campaigns/campaigns.service';

@Injectable({
  providedIn: 'root',
})
export class AudiencesResolver implements Resolve<any> {
  constructor(private audiencesService: AudiencesService) {}

  resolve(): Observable<[AudienceType[], DefaultAudienceType[]]> {
    return combineLatest([this.audiencesService.getAudiencesByTargetPaginated(), this.audiencesService.getDefaultAudiencesPaginated()]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AudienceDetailsResolver implements Resolve<any> {
  constructor(private audiencesService: AudiencesService, private questTypeService: QuestTypeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AudienceType | {}> {
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    return route.paramMap.get('id') === 'new-audience'
      ? this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination()
      : combineLatest([this.audiencesService.getAudienceById(route.paramMap.get('id')), this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination()]).pipe(
          catchError(() => {
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return of(null);
          }),
        );
  }
}
