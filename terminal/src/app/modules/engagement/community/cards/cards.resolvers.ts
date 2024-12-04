import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { CardsService } from './cards.service';

import { CorporateUserCardWithReputationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class CardResolver implements Resolve<any> {
  constructor(private cardsService: CardsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateUserCardWithReputationType[]> {
    return this.cardsService.getCorporateUserCardsByTargetWithReputationsPaginated();
  }
}
